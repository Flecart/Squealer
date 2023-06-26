import { Query, Request, Get, Route, Security } from '@tsoa/runtime';
import { getUserFromRequest } from '@api/utils';
import { SearchService } from './searchService';
import logger from '@server/logger';

const searchLogger = logger.child({ label: 'search' });

@Route('/search')
export class SearchController {
    @Get('/')
    @Security('jwt')
    public async listUsers(@Request() request: any, @Query() path?: any): Promise<any> {
        searchLogger.info('listUsers', { searchParams: request.params.searchParams });
        return new SearchService().search(getUserFromRequest(request), path);
    }
}
