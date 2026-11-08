// Skala Minecraft: 1 piksel model = 1/16 blok, entitas pemain diskalakan 15/16
export const MODEL_SCALE = 0.9375;
export const PX = (1 / 16) * MODEL_SCALE;

// Pivot leher / bahu atas (24 piksel dari telapak kaki)
export const NECK_Y = 24 * PX;

// Permukaan punggung badan (setengah tebal badan = 2 piksel)
export const BODY_BACK_Z = 2 * PX;
