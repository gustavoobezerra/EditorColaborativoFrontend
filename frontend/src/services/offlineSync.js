import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import QuillCursors from 'quill-cursors';
import Quill from 'quill';

// Register the cursors module
Quill.register('modules/cursors', QuillCursors);

/**
 * OfflineSyncService - Manages offline-first document synchronization using Yjs CRDT
 *
 * Features:
 * - Automatic conflict-free merging of changes
 * - IndexedDB persistence for offline editing
 * - WebSocket sync when online
 * - Network status detection
 * - Cursor awareness for collaborative editing
 */
class OfflineSyncService {
  constructor() {
    this.ydoc = null;
    this.provider = null;
    this.indexeddbProvider = null;
    this.awareness = null;
    this.ytext = null;
    this.binding = null;
    this.isOnline = navigator.onLine;
    this.documentId = null;
    this.quillInstance = null;
    this.statusCallbacks = [];

    // Listen to network status changes
    this.setupNetworkListeners();
  }

  /**
   * Initialize Yjs document with Quill editor
   * @param {string} documentId - The document ID
   * @param {Quill} quill - The Quill editor instance
   * @param {object} user - Current user information
   * @param {string} wsUrl - WebSocket server URL
   */
  async initialize(documentId, quill, user, wsUrl) {
    if (this.ydoc) {
      this.destroy();
    }

    this.documentId = documentId;
    this.quillInstance = quill;

    // Create Yjs document
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('quill');

    // Setup IndexedDB persistence (offline storage)
    this.indexeddbProvider = new IndexeddbPersistence(`collab-doc-${documentId}`, this.ydoc);

    await new Promise((resolve) => {
      this.indexeddbProvider.on('synced', () => {
        console.log('📦 IndexedDB synced - offline data loaded');
        resolve();
      });
    });

    // Setup WebSocket provider for online sync
    if (this.isOnline && wsUrl) {
      this.setupWebSocketProvider(wsUrl, user);
    }

    // Bind Quill to Yjs
    this.bindQuillToYjs(quill);

    this.notifyStatus({
      synced: true,
      online: this.isOnline,
      message: this.isOnline ? 'Connected and synced' : 'Offline mode - changes saved locally'
    });
  }

  /**
   * Setup WebSocket provider for real-time collaboration
   */
  setupWebSocketProvider(wsUrl, user) {
    try {
      // Extract base URL without http/https prefix for y-websocket
      const socketUrl = wsUrl.replace(/^https?:\/\//, '');

      this.provider = new WebsocketProvider(
        socketUrl,
        `document-${this.documentId}`,
        this.ydoc,
        {
          connect: this.isOnline
        }
      );

      this.awareness = this.provider.awareness;

      // Set local user state for cursor awareness
      if (user) {
        this.awareness.setLocalStateField('user', {
          name: user.name,
          color: user.color || this.generateUserColor(),
          id: user._id
        });
      }

      // Listen to provider events
      this.provider.on('status', ({ status }) => {
        console.log(`🔌 WebSocket status: ${status}`);
        this.notifyStatus({
          synced: status === 'connected',
          online: status === 'connected',
          message: status === 'connected' ? 'Synced with server' : 'Connecting...'
        });
      });

      this.provider.on('sync', (isSynced) => {
        console.log(`✅ Document sync status: ${isSynced}`);
        this.notifyStatus({
          synced: isSynced,
          online: this.isOnline,
          message: isSynced ? 'All changes synced' : 'Syncing changes...'
        });
      });

      // Setup cursor awareness in Quill
      this.setupCursorAwareness();

    } catch (error) {
      console.error('❌ Failed to setup WebSocket provider:', error);
      this.notifyStatus({
        synced: false,
        online: false,
        message: 'Failed to connect - working offline',
        error: error.message
      });
    }
  }

  /**
   * Bind Quill editor to Yjs text type
   * Uses manual binding compatible with Quill 1.3.7
   */
  bindQuillToYjs(quill) {
    this.isBinding = false;

    // Observe Yjs changes and update Quill
    this.ytext.observe((event) => {
      if (this.isBinding) return; // Prevent circular updates

      this.isBinding = true;

      try {
        // Convert Yjs delta to Quill delta
        const delta = event.delta;
        quill.updateContents(delta, 'silent');
      } catch (error) {
        console.error('Error applying Yjs changes to Quill:', error);
      } finally {
        this.isBinding = false;
      }
    });

    // Observe Quill changes and update Yjs
    quill.on('text-change', (delta, oldDelta, source) => {
      if (this.isBinding || source !== 'user') return; // Skip non-user or binding changes

      this.isBinding = true;

      try {
        this.ydoc.transact(() => {
          let index = 0;

          delta.ops.forEach(op => {
            if (op.retain !== undefined) {
              index += op.retain;
            } else if (op.insert !== undefined) {
              const text = typeof op.insert === 'string' ? op.insert : ' ';
              this.ytext.insert(index, text);
              index += text.length;
            } else if (op.delete !== undefined) {
              this.ytext.delete(index, op.delete);
            }
          });
        });
      } catch (error) {
        console.error('Error applying Quill changes to Yjs:', error);
      } finally {
        this.isBinding = false;
      }
    });

    this.binding = { destroy: () => {} }; // Mock binding object for cleanup
    console.log('🔗 Quill manually bound to Yjs document');
  }

  /**
   * Setup cursor awareness for collaborative editing
   */
  setupCursorAwareness() {
    if (!this.quillInstance || !this.awareness) return;

    try {
      const cursors = this.quillInstance.getModule('cursors');
      if (!cursors) {
        console.warn('⚠️ Cursors module not available');
        return;
      }

      // Update cursors when awareness changes
      this.awareness.on('change', () => {
        const states = Array.from(this.awareness.getStates().entries());

        states.forEach(([clientId, state]) => {
          if (clientId === this.awareness.clientID) return;

          const user = state.user;
          if (user && state.cursor) {
            cursors.createCursor(clientId, user.name, user.color);
            cursors.moveCursor(clientId, state.cursor);
          } else {
            cursors.removeCursor(clientId);
          }
        });
      });

      // Track local cursor position
      this.quillInstance.on('selection-change', (range) => {
        if (range) {
          this.awareness.setLocalStateField('cursor', range);
        }
      });

    } catch (error) {
      console.error('❌ Failed to setup cursor awareness:', error);
    }
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Network: ONLINE');
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Network: OFFLINE');
      this.isOnline = false;
      this.handleOffline();
    });
  }

  /**
   * Handle online event - reconnect WebSocket
   */
  handleOnline() {
    if (this.provider) {
      this.provider.connect();
    }

    this.notifyStatus({
      synced: false,
      online: true,
      message: 'Back online - syncing changes...'
    });
  }

  /**
   * Handle offline event - disconnect WebSocket
   */
  handleOffline() {
    if (this.provider) {
      this.provider.disconnect();
    }

    this.notifyStatus({
      synced: false,
      online: false,
      message: 'Offline mode - changes saved locally'
    });
  }

  /**
   * Get document content as Quill Delta
   */
  getContent() {
    if (!this.ytext) return null;

    const content = this.ytext.toDelta();
    return content;
  }

  /**
   * Set document content from Quill Delta
   */
  setContent(delta) {
    if (!this.ytext) return;

    this.ydoc.transact(() => {
      this.ytext.delete(0, this.ytext.length);
      if (delta && delta.ops) {
        delta.ops.forEach(op => {
          if (op.insert) {
            this.ytext.insert(this.ytext.length, op.insert, op.attributes);
          }
        });
      }
    });
  }

  /**
   * Register status callback
   */
  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all status callbacks
   */
  notifyStatus(status) {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  /**
   * Generate random user color
   */
  generateUserColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Destroy the sync service and clean up
   */
  destroy() {
    if (this.binding) {
      this.binding.destroy();
      this.binding = null;
    }

    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }

    if (this.indexeddbProvider) {
      this.indexeddbProvider.destroy();
      this.indexeddbProvider = null;
    }

    if (this.ydoc) {
      this.ydoc.destroy();
      this.ydoc = null;
    }

    this.awareness = null;
    this.ytext = null;
    this.quillInstance = null;
    this.documentId = null;
    this.statusCallbacks = [];

    console.log('🧹 OfflineSyncService destroyed');
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return {
      online: this.isOnline,
      synced: this.provider?.synced || false,
      connected: this.provider?.wsconnected || false,
      documentId: this.documentId
    };
  }
}

// Export singleton instance
export default new OfflineSyncService();
