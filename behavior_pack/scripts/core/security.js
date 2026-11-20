import { requireThat } from './errors.js';
// Engine event metadata, never a JSON field supplied by a form. Other installed server scripts are trusted code.
export function requireServerOrigin(event) {
  requireThat(event?.sourceType === 'Server' && !event.sourceEntity && !event.sourceBlock && !event.initiator, 'admin_source_required');
}
