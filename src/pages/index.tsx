import { GetStaticProps } from "next"
import { api } from "../services/api";

interface Episode {
  id: string;
  title: string;
  members: string;
}
interface HomeProps {
  episodes: Episode[];
}

export default function Home(props: HomeProps) {
  return (
    <h1>Index</h1>
  )
  
}

export const getStaticProps : GetStaticProps = async () => {
  const response = await api.get('/episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });
  const data = await response.data;

  return {
    props : {
      episodes : data,
    },
    revalidate : 60 * 60 * 8,
  }
}
