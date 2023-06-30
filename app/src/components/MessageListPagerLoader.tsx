import { memo, useState } from 'react';
import { Alert, Button, Stack } from 'react-bootstrap';
import { splitArrayInChunks } from 'src/utils';
import MessageListLoader from './MessageListLoader';

interface PropsMessageIds {
    childrens: string[];
}

interface PageProps {
    array: string[];
    index: number;
}

export default function MessageListPageLoader({ childrens }: PropsMessageIds): JSX.Element {
    if (childrens.length === 0) return <Alert>No Message</Alert>;
    const chunks = splitArrayInChunks(childrens, 10);
    function Inside(): JSX.Element {
        const [pageShow, setPageShow] = useState(0);

        const Page = memo(function Page({ array }: PageProps): JSX.Element {
            return <MessageListLoader childrens={array} />;
        }, areEqual);
        return (
            <Stack>
                {chunks
                    .filter((_, i) => i <= pageShow)
                    .map((arr, i) => {
                        return <Page key={i} array={arr} index={i} />;
                    })}
                {pageShow < chunks.length && (
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

function areEqual(prevProps: PageProps, nextProps: PageProps): boolean {
    return prevProps.index === nextProps.index;
}

// interface MessageListLoaderState {
//   pageShow: number;
//   aray: boolean[];
// }
//
// export default function MessageListPageLoader({ childrens }: PropsMessageIds): JSX.Element {
//   if (childrens.length === 0) return <Alert>No Message</Alert>;
//   const chunks = splitArrayInChunks(childrens, 10);
//   const [state, setState] = useState({
//     pageShow: 0,
//     aray: chunks.map((_, i) => i <= 0),
//   } satisfies MessageListLoaderState);
//
//   // eslint-disable-next-line react/display-name
//   const Page = memo(function({ array, show }: PageProps): JSX.Element {
//     if (show) {
//       return <MessageListLoader childrens={array} />;
//     }
//     return <></>;
//   });
//
//   const onShowMore = useCallback(() => {
//     setState({ pageShow: state.pageShow + 1, aray: state.aray.map((_, i) => i === state.pageShow + 1) });
//   }, []);
//
//   return (
//     <Stack>
//       {chunks.map((arr, i) => {
//         return <Page key={i} array={arr} show={state.aray[i] ?? false} />;
//       })}
//       {state.pageShow < chunks.length && <Button onClick={onShowMore}>Load more</Button>}
//     </Stack>
//   );
// }
//

// export default function MessageListPageLoader({ childrens }: PropsMessageIds): JSX.Element {
//   if (childrens.length === 0) return <Alert>No Message</Alert>;
//   const chunks = splitArrayInChunks(childrens, 10);
//   const [pageShow, setPageShow] = useState(0);
//
//   return (
//     <Stack>
//       {chunks
//         .filter((_, i) => i <= pageShow)
//         .map((arr, i) => {
//           return <MessageListLoader key={i} childrens={arr} />;
//         })}
//       {pageShow < chunks.length && (
//         <Button
//           onClick={(): void => {
//             setPageShow(pageShow + 1);
//           }}
//         >
//           Load more
//         </Button>
//       )}
//     </Stack>
//   );
// }
