export class AppController {
  
  /**
   * Shuts down the application.
   * If in Electron Client: Quits the Electron app.
   * If in Node.js/Server: Exits the process (0).
   */
  static async shutdown() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Electron Renderer (Client)
      await window.electronAPI.quit();
    } else {
      // Node.js (Server)
      console.log('AppController: Shutting down server...');
      process.exit(0);
    }
  }

  /**
   * Restarts the application.
   * If in Electron Client: Relaunches the Electron app.
   * If in Node.js/Server: Exits the process (0), expecting a process manager (PM2/Docker) to restart it.
   * Note: In Electron Server (Main/Child), restarting the renderer is not directly possible from here without IPC setup,
   * so it's recommended to call this from the Client in Electron.
   */
  static async restart() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Electron Renderer (Client)
      await window.electronAPI.restart();
    } else {
      // Node.js (Server)
      if (process.env.ELECTRON === 'true') {
        console.warn('AppController: Cannot restart Electron app from server process. Use client-side control.');
        // Optional: Could try to crash/exit to force reload if main.js handled it, but it doesn't currently.
      } else {
         console.log('AppController: Restarting server (exiting process)...');
         process.exit(0);
      }
    }
  }

  /**
   * Starts the application.
   * This is a logical method - if the code is running, the app is started.
   * This might be used to trigger initialization logic if needed.
   */
  static async start() {
    console.log('AppController: App is running.');
    return true;
  }
}
