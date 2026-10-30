import {standLayout} from './standLayout.ts';

/** One centreline controls the symmetric nose envelope, type plates and stand ID. */
export const apronAlignment={
 center:standLayout.aircraftCenterX,
 noseHalfWidth:3.8,
 plateWidth:3.2,
 plateGap:.8,
};
export const apronPlateLefts=[
 apronAlignment.center-apronAlignment.plateGap/2-apronAlignment.plateWidth,
 apronAlignment.center+apronAlignment.plateGap/2,
];
