
import { MediaItemData } from './types';

/**
 * INSTRUCTIONS FOR ADDING YOUR OWN MEDIA:
 * 1. Create a folder named 'public/media' in your project root.
 * 2. Drop your images and videos into that folder.
 * 3. Add them to the list below using the path '/media/your-file-name.ext'.
 */

export const MEDIA_COLLECTION: Partial<MediaItemData>[] = [
  // Example of local files (Add yours here)
  // { id: 'local-1', type: 'image', url: '/media/my-photo.jpg' },
  // { id: 'local-2', type: 'video', url: '/media/my-video.mp4' },

  // Current Cloud Samples
  { id: '1', type: 'image', url: 'https://picsum.photos/id/10/400/600' },
  { id: '2', type: 'image', url: 'https://picsum.photos/id/20/500/300' },
  { id: '3', type: 'image', url: 'https://picsum.photos/id/30/450/700' },
  { id: '4', type: 'image', url: 'https://picsum.photos/id/40/600/400' },
  { id: '5', type: 'image', url: 'https://picsum.photos/id/50/300/500' },
  { id: '6', type: 'image', url: 'https://picsum.photos/id/60/400/400' },
  { id: '7', type: 'image', url: 'https://picsum.photos/id/70/550/350' },
  { id: '8', type: 'image', url: 'https://picsum.photos/id/80/380/620' },
  { id: '9', type: 'image', url: 'https://picsum.photos/id/90/420/580' },
  { id: '10', type: 'image', url: 'https://picsum.photos/id/100/500/500' },
  { id: '11', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-971-large.mp4' },
  { id: '12', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-fast-moving-light-trails-34568-large.mp4' },
  { id: '13', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-bubbles-and-colorful-ink-4122-large.mp4' },
  { id: '14', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-444-large.mp4' },
  { id: '15', type: 'image', url: 'https://picsum.photos/id/110/400/300' },
  { id: '16', type: 'image', url: 'https://picsum.photos/id/120/300/400' },
  { id: '17', type: 'image', url: 'https://picsum.photos/id/130/500/350' },
  { id: '18', type: 'image', url: 'https://picsum.photos/id/140/450/450' },
  { id: '19', type: 'image', url: 'https://picsum.photos/id/150/320/480' },
  { id: '20', type: 'image', url: 'https://picsum.photos/id/160/600/400' },
];

export const EXPLOSION_DURATION = 7000; 
export const BASE_FALL_SPEED = 1.5;
