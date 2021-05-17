import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RiCalendarLine, RiUser3Line } from 'react-icons/ri';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  if (!post) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Desafio</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <img src={post.data.banner.url} alt="Imagem post" />
          <h1>{post.data.title}</h1>
          <div>
            <time>
              <RiCalendarLine size={20} />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <RiUser3Line size={20} />
              {post.data.author}
            </p>
            <p>
              <RiUser3Line size={20} />4 min
            </p>
          </div>
          {post.data.content.map((content, index) => (
            <div key={index}>
              <strong>{content.heading}</strong>
              {content.body.map(text => (
                <p key={text.text}>{text.text}</p>
              ))}
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [
    {
      params: { slug: 'como-utilizar-hooks' },
    },
    {
      params: { slug: 'criando-um-app-cra-do-zero' },
    },
  ],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: [
        {
          heading: response.data.content[0].heading,
          body: response.data.content[0].body,
        },
      ],
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 1 dia
  };
};
