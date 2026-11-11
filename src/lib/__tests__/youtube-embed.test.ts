import { describe, expect, it } from 'vitest';
import { isYouTubePlayingMessage, withYouTubeJsApi, youTubeListeningMessage } from '../youtube-embed';

describe('withYouTubeJsApi', () => {
  it('turns on the JavaScript API for the page origin and keeps the other parameters', () => {
    const url = new URL(withYouTubeJsApi('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1', 'http://localhost:5180'));
    expect(url.searchParams.get('enablejsapi')).toBe('1');
    expect(url.searchParams.get('origin')).toBe('http://localhost:5180');
    expect(url.searchParams.get('mute')).toBe('1');
  });
});

describe('youTubeListeningMessage', () => {
  it('is the widget channel listening event', () => {
    expect(JSON.parse(youTubeListeningMessage('preview-1'))).toEqual({ event: 'listening', id: 'preview-1', channel: 'widget' });
  });
});

describe('isYouTubePlayingMessage', () => {
  it('recognizes a playing state change and info updates that show playback', () => {
    expect(isYouTubePlayingMessage(JSON.stringify({ event: 'onStateChange', info: 1 }))).toBe(true);
    expect(isYouTubePlayingMessage(JSON.stringify({ event: 'infoDelivery', info: { playerState: 1 } }))).toBe(true);
    expect(isYouTubePlayingMessage({ event: 'infoDelivery', info: { currentTime: 0.4 } })).toBe(true);
  });

  it('ignores buffering, unstarted and unrelated messages', () => {
    expect(isYouTubePlayingMessage(JSON.stringify({ event: 'onStateChange', info: 3 }))).toBe(false);
    expect(isYouTubePlayingMessage(JSON.stringify({ event: 'initialDelivery', info: { playerState: -1, currentTime: 0 } }))).toBe(false);
    expect(isYouTubePlayingMessage(JSON.stringify({ event: 'onReady' }))).toBe(false);
    expect(isYouTubePlayingMessage('not json')).toBe(false);
    expect(isYouTubePlayingMessage(null)).toBe(false);
  });
});
