/** The supplied reference remains visible while WebGL loads or is unavailable. */
export function RoomStatic() {
  return (
    <div
      className="room-static"
      style={{
        position: "absolute",
        inset: "4%",
        background:
          "url('/images/room-reference.png') center / contain no-repeat",
      }}
    />
  );
}
