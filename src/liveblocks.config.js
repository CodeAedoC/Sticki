import { createClient, LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// // I created the Liveblocks client.
const client = createClient({
  // // IMPORTANT: Replace with your *public* API key in the .env file.
  // // For production, use authEndpoint: "/api/liveblocks-auth" endpoint.
  // // I now read the public key from the environment variable.
  publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY,
});

// // Presence, Storage, PathData, UserMeta, RoomEvent type definitions removed.
// // They are TypeScript syntax and not needed for JavaScript usage.
// // Liveblocks hooks work with plain JavaScript objects.

// // Type Presence removed
// type Presence = {
//   cursor: { x: number, y: number } | null;
//   color: string;
//   isDrawing: boolean;
// };

// // Type Storage removed
// type Storage = {
//   paths: LiveList<PathData>;
// };

// // Type PathData removed
// type PathData = {
//   color: string;
//   points: Array<[number, number]>;
// };

// // Type UserMeta removed
// type UserMeta = {
//   // id?: string;
//   // info?: Json;
// };

// // Type RoomEvent removed
// type RoomEvent = {
//   type: "DRAW";
//   data: PathData;
// } | {
//   type: "DRAW_UPDATE";
//   data: {
//     point: [number, number];
//     color: string;
//   }
// };

// // I created the RoomContext using the generic types defined above.
// // Note: Even though we removed the explicit JS `type` definitions,
// // Liveblocks internally uses these concepts. Providing the generics
// // helps ensure consistency if you ever migrate to TS or for library internals.
// // For pure JS, the generics here <Presence, Storage, UserMeta, RoomEvent> are effectively ignored by the JS runtime.
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useOthers,
  useBroadcastEvent,
  useEventListener,
  /* ...all the other hooks you exported */
} = createRoomContext/*<Presence, Storage, UserMeta, RoomEvent>*/(client); // // I commented out the explicit generics for clarity in JS.

// // Export type { PathData }; // Removed this line

// // Export the PathData type for use in components
// export type { PathData }; 