// IONOS API Client
const axios = require('axios');
require('dotenv').config();

class IonosApi {
  constructor() {
    this.apiKey = process.env.IONOS_API_KEY;
    this.baseUrl = process.env.IONOS_API_BASE_URL;
    this.version = process.env.IONOS_API_VERSION;
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/cloud/${this.version}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // List all servers
  async listServers() {
    try {
      const response = await this.client.get('/servers');
      return response.data;
    } catch (error) {
      console.error('Error listing servers:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create a new server
  async createServer(serverConfig) {
    try {
      const response = await this.client.post('/servers', serverConfig);
      return response.data;
    } catch (error) {
      console.error('Error creating server:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get server details
  async getServer(serverId) {
    try {
      const response = await this.client.get(`/servers/${serverId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting server:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new IonosApi();
