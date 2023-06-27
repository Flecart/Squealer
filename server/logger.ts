import winston from 'winston';

const printf = winston.format.printf(({ level, timestamp, message, mainLabel, label }) => {
    return `${timestamp} ${level}[${label || mainLabel}]: ${message}`;
});

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    format: winston.format.combine(winston.format.timestamp(), printf),
    transports: [
        new winston.transports.Console({
            level: 'info',

            format: winston.format.combine(winston.format.colorize(), printf),
        }),
        new winston.transports.File({
            filename: '/tmp/logs.log',
            level: 'info',
        }),
        new winston.transports.File({
            filename: '/tmp/debug.log',
            level: 'debug',
        }),
    ],
});

export default logger;
