// A deliberately simple frontend module; analysis should resolve ./format.js.
import { formatPoints } from './format.js';

export function renderScore(points) {
  return `Score: ${formatPoints(points)}`;
}
