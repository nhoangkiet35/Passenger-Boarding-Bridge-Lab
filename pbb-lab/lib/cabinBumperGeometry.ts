import { technicalConfig } from './technicalConfig.ts';

/** One fixed bumper at the floor nose, independent of canopy extension.
 * Raise the top clear of the deck to avoid coplanar yellow/grey surfaces. */
const rear=.9,front=1+technicalConfig.bumperProjection,top=.012,bottom=-.10;
export const cabinBumperGeometry={
 at:[(rear+front)/2,(top+bottom)/2,0] as [number,number,number],
 size:[front-rear,top-bottom,2.55] as [number,number,number],
 rear,front,top,bottom,
};
