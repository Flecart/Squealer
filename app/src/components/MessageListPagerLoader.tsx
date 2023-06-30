import { useState } from 'react';
import { Alert, Button, Stack } from 'react-bootstrap';
import { splitArrayInChunks } from 'src/utils';
import MessageListLoader from './MessageListLoader';

interface PropsMessageIds {
    childrens: string[];
}

export default function MessageListPageLoader({ childrens }: PropsMessageIds): JSX.Element {
    if (childrens.length === 0) return <Alert>No Message</Alert>;
    const chunks = splitArrayInChunks(childrens, 10);
    function Inside(): JSX.Element {
        const [pageShow, setPageShow] = useState(0);

        return (
            <Stack>
                {chunks
                    .filter((_, i) => i <= pageShow)
                    .map((arr, i) => {
                        return <MessageListLoader childrens={arr} key={i} />;
                    })}
                {pageShow < chunks.length - 1 && (
                    <Button
                        onClick={(): void => {
                            setPageShow(pageShow + 1);
                        }}
                    >
                        Load more
                    </Button>
                )}
            </Stack>
        );
    }
    return <Inside />;
}
