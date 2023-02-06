export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibmhhdGt5dHJhbiIsImEiOiJjbGRueXl5ZWUwb2J2M25teGlxa3k2ZHBiIn0.z6QFxDmQxu5ucx3Y2dMwgg';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/nhatkytran/cldnzbjlq001901p8dnrljne5', // style URL
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    // Create marker
    const element = document.createElement('div');
    element.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
