import { useEffect, useState } from 'react';
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

function SimpleElement({ index }: PageProps): JSX.Element {
    useEffect(() => {
        console.log(index);
    }, []);
    return <div>{index}</div>;
}

export default function MessageListPageLoader({ childrens }: PropsMessageIds): JSX.Element {
    if (childrens.length === 0) return <Alert>No Message</Alert>;
    const chunks = splitArrayInChunks(childrens, 10);
    function Inside(): JSX.Element {
        const [pageShow, setPageShow] = useState(0);

        // const Page = memo(function Page({ array, index }: PageProps): JSX.Element {
        //     console.log(index);
        //     return <MessageListLoader childrens={array} />;
        // }, areEqual);
        return (
            <Stack>
                {/* {chunks
                    .filter((_, i) => i <= pageShow)
                    .map((arr, i) => {
                        return <Page key={i} array={arr} index={i} />;
                    })} */}
                {pageShow < chunks.length && (
                    <Button
                        onClick={(): void => {
                            setPageShow(pageShow + 1);
                        }}
                    >
                        Load more
                    </Button>
                )}

                <ul>
                    <SimpleElement array={chunks[0] as string[]} index={0} />
                    {chunks
                        .filter((_, i) => i <= pageShow)
                        .map((arr, i) => {
                            return <SimpleElement array={chunks[i] as string[]} key={i} index={i} />;
                        })}

                    {chunks
                        .filter((_, i) => i <= pageShow)
                        .map((arr, i) => {
                            return <MessageListLoader childrens={arr} key={i} />;
                        })}
                </ul>
            </Stack>
        );
    }
    return <Inside />;
}

// function areEqual(prevProps: PageProps, nextProps: PageProps): boolean {
//     return prevProps.index === nextProps.index;
// }
// export default function MessageListPageLoader({ childrens }: PropsMessageIds): JSX.Element {
//     if (childrens.length === 0) return <Alert>No Message</Alert>;
//     const chunks: string[][] = useMemo(() => {return splitArrayInChunks(childrens, 10)}, []);
//     const [renderedIds, setRenderedIds] = useState<string[]>(chunks[0] ?? []);

//     useEffect(() => {
//         console.log("yes reneredIds changed");
//     }, [renderedIds]);

//     function Inside(): JSX.Element {
//         const pageShow = useRef(0);
//         return (
//             <Stack>
//                    {renderedIds.map((data, index) => (
//             <MessageListLoader key={index + 12345678}  childrens={[data]} />
//                     ))}
//                 {pageShow.current < chunks.length && (
//                     <Button
//                         onClick={(): void => {
//                             setRenderedIds((renderedIds) => renderedIds.concat(chunks[pageShow.current + 1] as string[]));
//                             pageShow.current = pageShow.current + 1;
//                         }}
//                     >
//                         Load more
//                     </Button>
//                 )}
//             </Stack>
//         );
//     }
//     return <Inside />;
// }

// function areEqual(prevProps: PageProps, nextProps: PageProps): boolean {
//     return prevProps.index === nextProps.index;
// }

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
