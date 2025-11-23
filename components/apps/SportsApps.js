import { jsx as _jsx } from "react/jsx-runtime";
import { BotAppTemplate } from './BotAppTemplate';
/**
 * These components are now wrappers around the generic BotAppTemplate.
 * This allows for easy instantiation and consistent UI across all "apps".
 */
export const NBABot = () => (_jsx(BotAppTemplate, { config: {
        sport: 'nba',
        title: 'NBA Courtside AI',
        themeColor: 'bg-orange-500',
        accentColor: 'text-orange-500'
    } }));
export const SoccerBot = () => (_jsx(BotAppTemplate, { config: {
        sport: 'soccer',
        title: 'Global Soccer Scout',
        themeColor: 'bg-green-500',
        accentColor: 'text-green-500'
    } }));
export const NFLBot = () => (_jsx(BotAppTemplate, { config: {
        sport: 'nfl',
        title: 'Gridiron Analytics',
        themeColor: 'bg-blue-600',
        accentColor: 'text-blue-500'
    } }));
export const TennisBot = () => (_jsx(BotAppTemplate, { config: {
        sport: 'tennis',
        title: 'Ace Tennis Tracker',
        themeColor: 'bg-yellow-500',
        accentColor: 'text-yellow-500'
    } }));
export const TableTennisBot = () => (_jsx(BotAppTemplate, { config: {
        sport: 'tt',
        title: 'Ping Pong Pro',
        themeColor: 'bg-purple-500',
        accentColor: 'text-purple-500'
    } }));
