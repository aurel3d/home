# Home Automation System

A custom home automation solution built with Vue.js, Node.js, and Zigbee2MQTT for Raspberry Pi.

## Features

- **Device Management**: Control Zigbee lights, switches, sensors, and outlets
- **Room Organization**: Group devices by rooms for better management
- **Real-time Updates**: Live device status updates via WebSocket
- **Material Design**: Modern UI with Vuetify components
- **Device Pairing**: Easy Zigbee device pairing through web interface
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM with SQLite database
- MQTT client for Zigbee2MQTT communication
- Socket.io for real-time updates

### Frontend
- Vue 3 + TypeScript
- Vuetify 3 (Material Design)
- Pinia for state management
- Socket.io client

### Infrastructure
- Zigbee2MQTT for device communication
- Mosquitto MQTT broker
- Docker for easy deployment

## Quick Start

### Prerequisites
- Raspberry Pi 4 (recommended)
- Zigbee USB adapter (CC2531, CC2652, ConBee II, etc.)
- Docker and Docker Compose
- Node.js 18+ and pnpm (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd home-automation
   ```

2. **Install dependencies**
   ```bash
   pnpm install:all
   # or manually:
   # pnpm install
   # cd backend && pnpm install
   # cd ../frontend && pnpm install
   ```

3. **Setup environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MQTT settings
   ```

4. **Initialize database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

### Development

Run both frontend and backend in development mode:
```bash
pnpm run dev
```

Or run separately:
```bash
# Backend (http://localhost:3000)
pnpm run dev:backend

# Frontend (http://localhost:5173)
pnpm run dev:frontend
```

### Production Deployment

1. **Configure Docker services**
   ```bash
   # Create required directories
   mkdir -p docker/mosquitto/{config,data,log}
   mkdir -p docker/zigbee2mqtt/data
   mkdir -p data
   ```

2. **Setup Mosquitto config**
   ```bash
   # Create docker/mosquitto/config/mosquitto.conf
   cat > docker/mosquitto/config/mosquitto.conf << EOF
   persistence true
   persistence_location /mosquitto/data/
   log_dest file /mosquitto/log/mosquitto.log
   listener 1883
   allow_anonymous true
   EOF
   ```

3. **Configure Zigbee2MQTT**
   ```bash
   # Edit docker/zigbee2mqtt/data/configuration.yaml
   # Update serial port and MQTT settings
   ```

4. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

## Configuration

### Environment Variables

Backend (`.env`):
```env
PORT=3000
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
DATABASE_URL="file:./dev.db"
```

### Zigbee2MQTT Configuration

Create `docker/zigbee2mqtt/data/configuration.yaml`:
```yaml
homeassistant: false
permit_join: false
mqtt:
  base_topic: zigbee2mqtt
  server: 'mqtt://mosquitto:1883'
serial:
  port: /dev/ttyUSB0
frontend:
  port: 8080
experimental:
  new_api: true
```

## API Endpoints

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices/:id/control` - Control device
- `PATCH /api/devices/:id/room` - Update device room

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:room/devices` - Get devices in room

### System
- `POST /api/pairing` - Enable/disable device pairing

## Device Types

Supported Zigbee device types:
- **Lights**: On/off, brightness control
- **Switches**: On/off control
- **Sensors**: Temperature, humidity, motion, etc.
- **Outlets**: Smart plugs and outlets
- **Dimmers**: Light dimmers

## Development

### Project Structure
```
home-automation/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── services/ # MQTT, Device services
│   │   └── routes/   # API routes
│   └── prisma/       # Database schema
├── frontend/         # Vue.js web app
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/   # Pinia stores
│   │   └── services/ # API client
└── shared/           # Shared TypeScript types
```

### Adding New Device Types

1. Update `shared/types.ts` with new device type
2. Add device mapping in `backend/src/services/mqtt.ts`
3. Create device component in `frontend/src/components/`
4. Update device card rendering logic

## Troubleshooting

### Zigbee Adapter Not Found
- Check USB device permissions: `ls -la /dev/ttyUSB*`
- Add user to dialout group: `sudo usermod -a -G dialout $USER`

### MQTT Connection Issues
- Verify Mosquitto is running: `docker logs mosquitto`
- Check network connectivity between services

### Device Pairing Problems
- Ensure pairing mode is enabled
- Check Zigbee2MQTT logs: `docker logs zigbee2mqtt`
- Verify device compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details