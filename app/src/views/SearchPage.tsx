import { useContext, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { AuthContext } from 'src/contexts';
import type SearchResult from '@model/search';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { ChannelListLoader } from 'src/components/ChannelList';
import { apiBase } from 'src/api/routes';
import MessageListPageLoader from 'src/components/MessageListPagerLoader';

interface SearchState {
    searching: boolean;
    searchResults: SearchResult | null;
    searchError: string;
}

export default function Search(): JSX.Element {
    const [state, setState] = useState<SearchState>({
        searching: false,
        searchResults: null,
        searchError: '',
    });

    const [authState] = useContext(AuthContext);

    function Content(): JSX.Element {
        if (state.searching) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner animation="border" role="status" />
                </div>
            );
        }
        if (state.searchError !== '') {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Alert variant="danger">{state.searchError}</Alert>
                </div>
            );
        }

        if (state.searchResults === null) return <></>;
        if (state.searchResults.channel.length === 0 && state.searchResults.messages.length === 0)
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Alert variant="info">No results found</Alert>
                </div>
            );
        return (
            <>
                {state.searchResults.channel.length !== 0 && (
                    <ChannelListLoader channels={state.searchResults.channel} />
                )}
                {state.searchResults.messages.length !== 0 && (
                    <MessageListPageLoader childrens={state.searchResults.messages} />
                )}
            </>
        );
    }

    function Search(): JSX.Element {
        // facendo questo componente ogni volta che si va a scrivere nel form non si ricarica la pagina
        // però il problma che ogni volta che si fa un submit viene cancellato l'input
        const [search, setSearch] = useState<string>('');
        const handleSearch = (e: React.FormEvent): void => {
            e.preventDefault();

            setState({
                searching: true,
                searchResults: null,
                searchError: '',
            });
            const searchParam = new URLSearchParams(`search=${encodeURI(search)}`).toString();
            fetchApi<SearchResult>(
                `${apiBase}/search?${searchParam}`,
                { method: 'GET' },
                authState,
                (results) => {
                    setState({ ...state, searching: false, searchResults: results });
                },
                (error) => {
                    setState({ ...state, searching: false, searchError: error.message });
                },
            );
        };

        return (
            <form className="form-outline m-4 d-flex flex-col flex-md-row  ">
                <input
                    className=" form-control h-12 px-4 text-lg text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:shadow-outline"
                    type="text"
                    placeholder="Search for messages"
                    aria-label="Search Bar Input"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />

                <button onClick={handleSearch} onSubmit={handleSearch} className="btn" type="submit">
                    Search
                </button>
            </form>
        );
    }

    return (
        <SidebarSearchLayout>
            <Search />

            <Content />
        </SidebarSearchLayout>
    );
}
