# Modern Notification System

A lightweight, customizable notification system with smooth animations and sound effects. The notifications have a sleek, modern design inspired by mobile OS notifications.

## Features

- Modern, minimalist design inspired by iOS/Android notifications
- Sound notifications based on type (success, error, info)
- Automatically disappears after timeout
- Pause timeout on hover
- Mobile haptic feedback (vibration)
- Dark mode support
- Swipe to dismiss in any direction (up, down, left, right)
- Mobile-friendly and responsive

## Demo

Open `notification-demo.html` to see the notification system in action. The demo includes examples of different notification types and customization options.

## How to Use

### 1. Include the Files

```html
<link rel="stylesheet" href="modern-notifications.css">
<script src="modern-notifications.js"></script>
```

Don't forget to include FontAwesome or another icon library for the notification icons:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
```

### 2. Add a Container (Optional)

```html
<div id="notifications" class="notifications"></div>
```

Note: If you don't add this, the script will create it automatically.

### 3. Show Notifications

```javascript
// Basic usage
showNotification('Your message here', 'success');

// With options
showNotification('Custom notification', 'info', {
  appName: 'My App',
  icon: '<i class="fas fa-bell"></i>',
  duration: 5000,  // 5 seconds
  enableSwipe: true,  // Enable swipe to dismiss (default: true)
  minSwipeDistance: 50  // Minimum swipe distance in pixels (default: 50)
});
```

## API Reference

### `showNotification(message, type, options)`

Shows a notification with the specified message and type.

- **message** (string): The message to display
- **type** (string): The type of notification: 'success', 'error', or 'info'
- **options** (object): Additional optional configuration
  - **appName** (string): Custom app name (defaults based on notification type)
  - **icon** (string): Custom icon HTML (defaults based on notification type)
  - **duration** (number): Custom duration in milliseconds (default: 3000ms)
  - **enableSwipe** (boolean): Enable swipe to dismiss feature (default: true)
  - **minSwipeDistance** (number): Minimum swipe distance to dismiss in pixels (default: 50)

Returns the notification element that was created.

### `playNotificationSound(type)`

Plays a notification sound based on the type specified.

- **type** (string): The type of sound to play: 'success', 'error', or 'info'

## Swipe to Dismiss

The notification system supports dismissing notifications with touch gestures in any direction:

- Swipe left or right: Notification slides out in that direction
- Swipe up or down: Notification slides out in that direction
- Partial swipe: If the swipe distance is less than the threshold, the notification bounces back

This feature is particularly useful on mobile devices, providing a native-like experience for dismissing notifications.

### Configuration Options:

- `enableSwipe`: Set to `false` to disable the swipe feature
- `minSwipeDistance`: Set the minimum swipe distance required to dismiss (default is 50 pixels)

## Browser Support

The notification system works in all modern browsers, including:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

MIT - Feel free to use, modify and distribute as needed.

---

Made with ❤️ for better user experiences. 