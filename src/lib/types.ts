/** Raw row from public.movies_db */
export interface DBMovie {
  imdb_id: string
  movie_title: string
  title_year: number | null
  imdb_score: number | null
  genres: string | null            // pipe-separated: "Action|Drama|Thriller"
  director_name: string | null
  plot_keywords: string | null     // pipe-separated keywords
  duration: number | null          // minutes as integer
  content_rating: string | null
  language: string | null
  country: string | null
  color: string | null
  gross: number | null
  budget: number | null
  num_voted_users: number | null
  num_user_for_reviews: number | null
  num_critic_for_reviews: number | null
  cast_total_facebook_likes: number | null
  movie_facebook_likes: number | null
  director_facebook_likes: number | null
  actor_1_facebook_likes: number | null
  actor_2_facebook_likes: number | null
  actor_3_facebook_likes: number | null
  actor_1_name: string | null
  actor_2_name: string | null
  actor_3_name: string | null
  movie_imdb_link: string | null
  facenumber_in_poster: number | null
  aspect_ratio: number | null
}
