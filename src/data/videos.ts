export interface Video {
  id: string
  title: string
  youtubeId: string
  description?: string
}

export const videos: Video[] = [
  {
    id: '1',
    title: 'Tom and Jerry - Classic Cartoon',
    youtubeId: 'kP9TfCWaQT4', // Popular Tom and Jerry video
    description: 'Fun adventures of Tom and Jerry',
  },
  {
    id: '2',
    title: 'Tom and Jerry - Best Moments',
    youtubeId: 't0Q2otsqC4I', // Another popular Tom and Jerry video
    description: 'Best moments from Tom and Jerry',
  },
  {
    id: '3',
    title: 'Tom and Jerry - Full Episode',
    youtubeId: 'wNa3bwGX7E8', // Another Tom and Jerry video
    description: 'Full episode of Tom and Jerry',
  },
]

