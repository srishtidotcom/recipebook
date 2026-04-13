export function getRecipeFallbackImage(title = '') {
  const query = encodeURIComponent(`${title} food recipe`.trim());
  return `https://source.unsplash.com/800x600/?${query}`;
}

export function getRecipeImageUrl(recipe) {
  return recipe?.image || getRecipeFallbackImage(recipe?.title || '');
}

function extractYouTubeVideoId(url = '') {
  if (!url) return null;
  const trimmed = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i,
    /youtube\.com\/embed\/([^&?/]+)/i,
    /youtube\.com\/shorts\/([^&?/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function getRecipeYoutubeEmbedUrl(youtubeUrl = '', title = '') {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;

  const query = encodeURIComponent(`${title} recipe`);
  return `https://www.youtube.com/embed?listType=search&list=${query}`;
}
