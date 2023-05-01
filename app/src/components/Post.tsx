import { Container, Stack } from 'react-bootstrap';

const gPost: PostProps[] = [
    {
        key: 1,
        author: {
            name: 'Utente 1',
            img: {
                src: 'https://picsum.photos/50/50',
                description: 'Immagine profilo 1',
            },
        },
        content: {
            img: {
                src: 'https://picsum.photos/300/500',
                description: 'Immagine 1',
            },
            text: null,
        },
    },
    {
        key: 2,
        author: {
            name: 'Utente 2',
            img: {
                src: 'https://picsum.photos/50/50',
                description: 'Immagine profilo 2',
            },
        },
        content: {
            img: {
                src: 'https://picsum.photos/500/300',
                description: 'Immagine 2',
            },
            text: 'Lorem Lorem Lorem Lorem Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquam nunc, vitae aliquam nisl nunc vitae nisl.',
        },
    },
    {
        key: 3,
        author: {
            name: 'Utente 3',
            img: {
                src: 'https://picsum.photos/50/50',
                description: 'Immagine profilo 3',
            },
        },
        content: {
            img: null,
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquam nunc, vitae aliquam nisl nunc vitae nisl.',
        },
    },
];

interface PostProps {
    key: number;
    author: AuthorProps;
    content: PostContentProps;
}

interface AuthorProps {
    name: string;
    img: {
        src: string;
        description: string;
    };
}

interface PostContentProps {
    img: {
        src: string;
        description: string;
    } | null;
    text: string | null;
}

function MakePost({ author, content }: PostProps): JSX.Element {
    return (
        <Container className="p-3 border-bottom border-light d-flex flex-column d-flex">
            <Author {...author} />
            <hr className="" />
            <PostContent {...content} />
        </Container>
    );
}

function PostContent(content: PostContentProps): JSX.Element {
    return (
        <Container className="">
            <Stack className="" gap={3}>
                {content.text !== null ? (
                    <Container className="container-fluid  text-break">{content.text}</Container>
                ) : null}
                {content.img !== null ? (
                    <img
                        src={content.img.src}
                        className="rounded align-self-center image-fluid"
                        alt={content.img.description}
                    />
                ) : null}
            </Stack>
        </Container>
    );
}

function Author(author: AuthorProps): JSX.Element {
    return (
        <Container className="">
            <Container className="d-flex align-items-center">
                <Container className="container-fluid text-break">{author.name}</Container>
                <img
                    src={author.img.src}
                    className="rounded align-self-center image-fluid"
                    alt={author.img.description}
                />
            </Container>
        </Container>
    );
}

export function MakeFeed(): JSX.Element {
    const contents = gPost;
    const Feed = contents.map((content: PostProps) => {
        return <MakePost author={content.author} content={content.content} key={content.key} />;
    });

    return (
        // xs={6} -> className="... col-xs-6 ..."
        <Stack className="d-flex col-xs-6 flex-column-reverse p-1">{Feed}</Stack>
    );
}
