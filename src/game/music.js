export function getNextMusicTrack(tracks, currentTrackId) {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return null;
  }

  const currentIndex = tracks.findIndex((track) => track.id === currentTrackId);
  const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  return tracks[nextIndex % tracks.length];
}
