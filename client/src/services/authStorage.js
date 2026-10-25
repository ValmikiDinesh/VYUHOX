/**
 * Tab-Isolated Auth & Session Storage
 * Scopes active session tokens and workspace identity per browser tab using sessionStorage
 * with localStorage fallback for initial tab boot.
 * Prevents multiple tabs logged into different client accounts from colliding or overwriting each other.
 */

export const authStorage = {
  getToken: () => {
    try {
      return sessionStorage.getItem('vyuhox_token') || localStorage.getItem('vyuhox_token') || null;
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        sessionStorage.setItem('vyuhox_token', token);
        localStorage.setItem('vyuhox_token', token);
      } else {
        sessionStorage.removeItem('vyuhox_token');
        localStorage.removeItem('vyuhox_token');
      }
    } catch (e) {
      console.warn('Storage setToken error:', e);
    }
  },

  setSession: (token, user, workspace) => {
    try {
      if (token) {
        sessionStorage.setItem('vyuhox_token', token);
        localStorage.setItem('vyuhox_token', token);
      }
      if (user) {
        const uStr = JSON.stringify(user);
        sessionStorage.setItem('vyuhox_user', uStr);
        localStorage.setItem('vyuhox_user', uStr);
      }
      if (workspace) {
        const wStr = JSON.stringify(workspace);
        sessionStorage.setItem('vyuhox_active_workspace', wStr);
        localStorage.setItem('vyuhox_active_workspace', wStr);
        if (workspace._id) {
          sessionStorage.setItem('vyuhox_active_ws_id', String(workspace._id));
          localStorage.setItem('vyuhox_active_ws_id', String(workspace._id));
        }
      }
    } catch (e) {
      console.warn('Storage setSession error:', e);
    }
  },

  getUser: () => {
    try {
      const raw = sessionStorage.getItem('vyuhox_user') || localStorage.getItem('vyuhox_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        const str = JSON.stringify(user);
        sessionStorage.setItem('vyuhox_user', str);
        localStorage.setItem('vyuhox_user', str);
      } else {
        sessionStorage.removeItem('vyuhox_user');
        localStorage.removeItem('vyuhox_user');
      }
    } catch (e) {
      console.warn('Storage setUser error:', e);
    }
  },

  getActiveWorkspace: () => {
    try {
      const raw = sessionStorage.getItem('vyuhox_active_workspace') || localStorage.getItem('vyuhox_active_workspace');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setActiveWorkspace: (ws) => {
    try {
      if (ws) {
        const str = JSON.stringify(ws);
        sessionStorage.setItem('vyuhox_active_workspace', str);
        localStorage.setItem('vyuhox_active_workspace', str);
        if (ws._id) {
          sessionStorage.setItem('vyuhox_active_ws_id', String(ws._id));
          localStorage.setItem('vyuhox_active_ws_id', String(ws._id));
        }
      } else {
        sessionStorage.removeItem('vyuhox_active_workspace');
        localStorage.removeItem('vyuhox_active_workspace');
        sessionStorage.removeItem('vyuhox_active_ws_id');
        localStorage.removeItem('vyuhox_active_ws_id');
      }
    } catch (e) {
      console.warn('Storage setActiveWorkspace error:', e);
    }
  },

  getActiveWsId: () => {
    try {
      return sessionStorage.getItem('vyuhox_active_ws_id') || localStorage.getItem('vyuhox_active_ws_id') || null;
    } catch {
      return null;
    }
  },

  setActiveWsId: (wsId) => {
    try {
      if (wsId) {
        sessionStorage.setItem('vyuhox_active_ws_id', String(wsId));
        localStorage.setItem('vyuhox_active_ws_id', String(wsId));
      } else {
        sessionStorage.removeItem('vyuhox_active_ws_id');
        localStorage.removeItem('vyuhox_active_ws_id');
      }
    } catch (e) {
      console.warn('Storage setActiveWsId error:', e);
    }
  },

  clearSession: () => {
    try {
      sessionStorage.removeItem('vyuhox_token');
      sessionStorage.removeItem('vyuhox_user');
      sessionStorage.removeItem('vyuhox_active_workspace');
      sessionStorage.removeItem('vyuhox_active_ws_id');
      localStorage.removeItem('vyuhox_token');
      localStorage.removeItem('vyuhox_user');
      localStorage.removeItem('vyuhox_active_workspace');
      localStorage.removeItem('vyuhox_active_ws_id');
    } catch (e) {
      console.warn('Storage clearSession error:', e);
    }
  },
};

export default authStorage;
