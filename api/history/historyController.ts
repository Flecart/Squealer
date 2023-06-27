import { Query, Get, Post, Route, Request, Response, SuccessResponse, Controller, Security } from '@tsoa/runtime';
import { HistoryService } from './historyService';
import { HttpError } from '@model/error';
import { getUserFromRequest } from '@api/utils';
import { HistoryPoint } from '@model/history';

import logger from '@server/logger';

const historyLogger = logger.child({ label: 'history' });

@Route('/history')
export class HistoryController extends Controller {
    @Get('')
    @Security('jwt')
    @Response<HttpError>(401, 'Unauthorized')
    @SuccessResponse(400, 'Bad Request')
    public async getHistory(
        @Request() request: any,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<HistoryPoint[]> {
        if (!from) {
            from = new Date().toISOString().slice(0, 10); // get YYYY-MM-DD
        }

        if (!to) {
            to = new Date().toISOString().slice(0, 10);
        }
        historyLogger.info(
            `getting all history points from ${from} to ${to} for user '${getUserFromRequest(request)}'`,
        );
        return new HistoryService().getHistory(getUserFromRequest(request), from, to);
    }

    @Post('update')
    @Security('jwt')
    @Response<HttpError>(401, 'Unauthorized')
    @SuccessResponse(200, 'Successful history update')
    public async updateHistory(@Request() request: any): Promise<{ msg: string }> {
        historyLogger.info(`updating history for user '${getUserFromRequest(request)}'`);
        return new HistoryService().updateHistory(getUserFromRequest(request));
    }
}
