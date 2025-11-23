import { bus } from './eventBus';
const uuid = () => Math.random().toString(36).substr(2, 9);
class NotificationService {
    send(title, message, type = 'info') {
        const notification = {
            id: uuid(),
            title,
            message,
            type,
            timestamp: Date.now()
        };
        bus.emit('notification', notification);
    }
    success(title, message) { this.send(title, message, 'success'); }
    error(title, message) { this.send(title, message, 'error'); }
    info(title, message) { this.send(title, message, 'info'); }
    warning(title, message) { this.send(title, message, 'warning'); }
}
export const notify = new NotificationService();
