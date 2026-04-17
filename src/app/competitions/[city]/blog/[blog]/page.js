import { getPostData } from '@/lib/blog';
import { notFound } from 'next/navigation';
import styles from './blog.module.css';
import { getNewsBySlug } from '@/lib/queries';
import { remark } from 'remark';
import html from 'remark-html';
import Image from 'next/image';

export default async function BlogPostPage({ params }) {
    const resolvedParams = await params;
    const { city, blog: slug } = resolvedParams;

    try {
        const postData = await getNewsBySlug(slug);
        const processedContent = await remark()
        .use(html)
        .process(postData.content);
        const contentHtml = processedContent.toString();

        if (postData.local_league?.toLowerCase() !== city.toLowerCase()) {
            notFound();
        }

        const formattedDate = postData.date
            ? new Date(postData.date).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
              })
            : null;

        return (
            <section className={styles.page}>
                <article className={styles.article}>
                    <header className={styles.hero}>
                        <div className={styles.heroContent}>
                            <p className={styles.eyebrow}>{(postData.local_league ?? city).toUpperCase()}</p>
                            <h1 className={styles.title}>{postData.title}</h1>
                            {postData.subtitle && (
                                <p className={styles.subtitle}>{postData.subtitle}</p>
                            )}
                            <div className={styles.meta}>
                                {postData.author && <span>{postData.author}</span>}
                                {postData.author && formattedDate && (
                                    <span className={styles.metaDivider} aria-hidden="true">
                                        ·
                                    </span>
                                )}
                                {formattedDate && <span>{formattedDate}</span>}
                            </div>
                            {postData.tags?.length > 0 && (
                                <ul className={styles.tags}>
                                    {postData.tags.map((tag) => (
                                        <li key={tag}>{tag}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {postData.image && (
                            <div className={styles.heroMedia}>
                                <Image
                                    src={postData.image}
                                    alt={postData.title}
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    width={800}
                                    height={450}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        )}
                    </header>
                    <div className={styles.bodyCard}>
                        <div
                            className={styles.content}
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    </div>
                </article>
            </section>
        );
    } catch (e) {
        console.error(e);
        notFound();
    }
}
