import { GetStaticPaths, GetStaticProps } from "next"
import { api } from '../../services/api';

import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import Image from 'next/image'
import Link from 'next/link';

import styles from './episode.module.scss';

import { useRouter } from 'next/router';

interface Episode {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  description: string;
  url: string;
}

interface EpisodeProps{
  episode: Episode;
}

export default function Episode( { episode } : EpisodeProps){

  const router = useRouter();

  if (router.isFallback){
    return <p>Carregando...</p>
  }

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>

        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
        </Link>
        <Image
        width={700}
        height={160}
        src={episode.thumbnail}
        objectFit="cover"
        />
        <button type="button">
          <img src="/play.svg" alt="Tocar episódio"/>
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div 
      className={styles.description} 
      dangerouslySetInnerHTML={{ __html : episode.description}} 
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {

  const { data } = await api.get('episodes', {
    params : {
      _limit : 2,
      _sort : 'published_at',
      _order : 'desc'
    }
  });

  const paths = data.map( episode => {
    return {
      params : {
        slug : episode.id
      }
    }
  })

  return {
    paths, //parametros de request que vao ficar pre-carregadas
    fallback: 'blocking' // false : retorna 404 se nao tiver nada pre-carregada 
    // true : carrega as rotas pelo lado do cliente 
    //blocking : o cliente so vai ser enviado para a pagina qnd ela tiver carregada, ajuda no SEO
  }
}

export const getStaticProps : GetStaticProps = async (context) => {
  const { slug } = context.params;

  const response = await api.get(`/episodes/${slug}`);

  const data = response.data;
  
  const episode = {
    id : data.id,
    title : data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale : ptBR}),
    duration: Number(data.file.duration),
    durationAsString : convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url
  }
  return {
    props : {
      episode
    },
    revalidate : 60 * 60 * 24, //24h
  }
}
