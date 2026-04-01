export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  director: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  duration: string;
  trailerUrl: string;
}

export const GENRES = [
  "All",
  "Action",
  "Drama",
  "Sci-Fi",
  "Thriller",
  "Comedy",
  "Horror",
  "Romance",
  "Animation",
] as const;

export const movies: Movie[] = [
  {
    id: 1,
    title: "Blade Runner 2049",
    year: 2017,
    rating: 8.0,
    genre: ["Sci-Fi", "Drama", "Thriller"],
    director: "Denis Villeneuve",
    synopsis: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg",
    duration: "2h 44m",
    trailerUrl: "https://www.youtube.com/watch?v=gCcx85e8sb4",
  },
  {
    id: 2,
    title: "Parasite",
    year: 2019,
    rating: 8.5,
    genre: ["Drama", "Thriller", "Comedy"],
    director: "Bong Joon-ho",
    synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    duration: "2h 12m",
    trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
  },
  {
    id: 3,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    genre: ["Sci-Fi", "Drama"],
    director: "Christopher Nolan",
    synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK1EVlS7w.jpg",
    duration: "2h 49m",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
  },
  {
    id: 4,
    title: "The Grand Budapest Hotel",
    year: 2014,
    rating: 8.1,
    genre: ["Comedy", "Drama"],
    director: "Wes Anderson",
    synopsis: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy.",
    poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nX5XotM9yprCKarRH4fzOq1VM1J.jpg",
    duration: "1h 39m",
    trailerUrl: "https://www.youtube.com/watch?v=1Fg5iWmQjwk",
  },
  {
    id: 5,
    title: "Mad Max: Fury Road",
    year: 2015,
    rating: 8.1,
    genre: ["Action", "Sci-Fi", "Thriller"],
    director: "George Miller",
    synopsis: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners and a drifter.",
    poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFBO.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/phszHPFVhPHhMZgo0fWTKBDQsJA.jpg",
    duration: "2h 0m",
    trailerUrl: "https://www.youtube.com/watch?v=hEJnMQG9ev8",
  },
  {
    id: 6,
    title: "The Shining",
    year: 1980,
    rating: 8.4,
    genre: ["Horror", "Thriller"],
    director: "Stanley Kubrick",
    synopsis: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence.",
    poster: "https://image.tmdb.org/t/p/w500/nRj5511mZdTl4saWEPoj9QroTIu.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/mmd1HnuvAzFc4MCwJVAagimSxOD.jpg",
    duration: "2h 26m",
    trailerUrl: "https://www.youtube.com/watch?v=S014oGZiSdI",
  },
  {
    id: 7,
    title: "La La Land",
    year: 2016,
    rating: 8.0,
    genre: ["Romance", "Drama", "Comedy"],
    director: "Damien Chazelle",
    synopsis: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nadTlnTE6DjKQh40rMR9Z0VQr8E.jpg",
    duration: "2h 8m",
    trailerUrl: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
  },
  {
    id: 8,
    title: "Spirited Away",
    year: 2001,
    rating: 8.6,
    genre: ["Animation", "Drama"],
    director: "Hayao Miyazaki",
    synopsis: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
    poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
    duration: "2h 5m",
    trailerUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
  },
  {
    id: 9,
    title: "No Country for Old Men",
    year: 2007,
    rating: 8.2,
    genre: ["Thriller", "Drama"],
    director: "Coen Brothers",
    synopsis: "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.",
    poster: "https://image.tmdb.org/t/p/w500/bj1v6YKF8yHqA489GFiHRgeTVMi.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/gGBu0hKw9BGddG8RkRAMX7B6NDB.jpg",
    duration: "2h 2m",
    trailerUrl: "https://www.youtube.com/watch?v=38A__WT3-o0",
  },
  {
    id: 10,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    genre: ["Action", "Drama", "Thriller"],
    director: "Christopher Nolan",
    synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nYisz.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
    duration: "2h 32m",
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
  },
  {
    id: 11,
    title: "Whiplash",
    year: 2014,
    rating: 8.5,
    genre: ["Drama"],
    director: "Damien Chazelle",
    synopsis: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    poster: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fRGxZuo7jJUWQsVzSmm6A3tembi.jpg",
    duration: "1h 46m",
    trailerUrl: "https://www.youtube.com/watch?v=7d_jQycdQGo",
  },
  {
    id: 12,
    title: "Get Out",
    year: 2017,
    rating: 7.7,
    genre: ["Horror", "Thriller"],
    director: "Jordan Peele",
    synopsis: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
    poster: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3zy7uCiqQhn2GCWJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/sXnbOhTiMPoofDsrJZFnSBJlOhl.jpg",
    duration: "1h 44m",
    trailerUrl: "https://www.youtube.com/watch?v=DzfpyUB60YY",
  },
];

export function getRecommendations(likedMovieIds: number[]): Movie[] {
  if (likedMovieIds.length === 0) return movies.slice(0, 6);

  const likedMovies = movies.filter((m) => likedMovieIds.includes(m.id));
  const genreCount: Record<string, number> = {};
  const directorCount: Record<string, number> = {};

  likedMovies.forEach((m) => {
    m.genre.forEach((g) => (genreCount[g] = (genreCount[g] || 0) + 1));
    directorCount[m.director] = (directorCount[m.director] || 0) + 1;
  });

  const unlicked = movies.filter((m) => !likedMovieIds.includes(m.id));

  const scored = unlicked.map((m) => {
    let score = 0;
    m.genre.forEach((g) => (score += (genreCount[g] || 0) * 2));
    score += (directorCount[m.director] || 0) * 3;
    score += m.rating * 0.5;
    return { movie: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 6).map((s) => s.movie);
}
