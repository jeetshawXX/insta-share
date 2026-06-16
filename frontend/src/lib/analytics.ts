/**
 * Google Analytics helper functions
 * Track custom events for better insights
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Track page view
 * @param path - Page path (e.g., '/room/ABC123')
 */
export function trackPageView(path: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
}

/**
 * Track custom event
 * @param eventName - Name of the event
 * @param params - Additional parameters
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track room creation
 */
export function trackRoomCreated(roomCode: string, hasPassword: boolean) {
  trackEvent('room_created', {
    room_code: roomCode,
    has_password: hasPassword,
    event_category: 'engagement',
  });
}

/**
 * Track room joined
 */
export function trackRoomJoined(roomCode: string) {
  trackEvent('room_joined', {
    room_code: roomCode,
    event_category: 'engagement',
  });
}

/**
 * Track message sent
 */
export function trackMessageSent(messageType: 'text' | 'code' | 'media') {
  trackEvent('message_sent', {
    message_type: messageType,
    event_category: 'engagement',
  });
}

/**
 * Track file upload
 */
export function trackFileUpload(fileType: string, fileSize: number) {
  trackEvent('file_upload', {
    file_type: fileType,
    file_size: fileSize,
    event_category: 'engagement',
  });
}

/**
 * Track QR code generation
 */
export function trackQRCodeGenerated() {
  trackEvent('qr_code_generated', {
    event_category: 'feature_usage',
  });
}

/**
 * Track room share
 */
export function trackRoomShared(method: 'link' | 'qr') {
  trackEvent('room_shared', {
    share_method: method,
    event_category: 'feature_usage',
  });
}

/**
 * Track reaction added
 */
export function trackReactionAdded(emoji: string) {
  trackEvent('reaction_added', {
    emoji: emoji,
    event_category: 'engagement',
  });
}

/**
 * Track code snippet shared
 */
export function trackCodeShared(language: string) {
  trackEvent('code_shared', {
    language: language,
    event_category: 'engagement',
  });
}
