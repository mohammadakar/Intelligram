import { useState, useEffect } from 'react';

const NominatimAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="nominatim-autocomplete">
      <input
        type="text"
        placeholder="Search location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded-lg"
      />
      {suggestions.length > 0 && (
        <ul className="bg-white border rounded-lg mt-1" style={{ listStyle: 'none', padding: 0 }}>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              style={{ padding: '0.5rem', cursor: 'pointer' }}
              onClick={() => {
                onSelect(suggestion);
                setQuery(suggestion.display_name);
                setSuggestions([]);
              }}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NominatimAutocomplete;
