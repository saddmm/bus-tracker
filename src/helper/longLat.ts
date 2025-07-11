export const formatLongLat = (location: { latitude: number; longitude: number }) => {
  const { latitude, longitude } = location

  return [[longitude, latitude]]
}
