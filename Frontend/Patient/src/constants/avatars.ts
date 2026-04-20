import { personas } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

const userAvatar = createAvatar(personas, {
    "backgroundColor": [
    "b6e3f4",
    "d1d4f9",
    "c0aede",
    "ffd5dc",
    "ffdfbf"
    ],
    "scale": 90,
    "translateY": 5,
    "seed": "Brooklynn",
    "eyes": ["happy"],
    "mouth": ["smile"],
    "body": [
    "checkered",
    "rounded",
    "squared"
    ]
});
export const userSvg = userAvatar.toString();

const doctorAvatar = createAvatar(personas, {
    "backgroundColor": [
    "b6e3f4",
    "d1d4f9",
    "c0aede",
    "ffd5dc",
    "ffdfbf"
    ],
    "scale": 90,
    "translateY": 5,
    "seed": "Brooklynn",
    "eyes": ["happy"],
    "mouth": ["smile"],
    "body": [
    "checkered",
    "rounded",
    "squared"
    ]
});
export const doctorSvg = doctorAvatar.toString();