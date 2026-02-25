// src/wsClient.js
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { SubmissionSummaryDto } from '../../redux/api/transgressionsApi';

// keep a single instance
let stompClient: Client | null = null;

export enum AdjudicationEventType {
    ADJUDICATION_STARTED = 'ADJUDICATION_STARTED',
    ADJUDICATION_COMPLETED = 'ADJUDICATION_COMPLETED',
    ADJUDICATION_CANCELLED = 'ADJUDICATION_CANCELLED',
    USER_CONNECTED = 'USER_CONNECTED',
    USER_DISCONNECTED = 'USER_DISCONNECTED',
}

export type AdjudicationEvent = {
    username: string;
    updatedNoticeNumber: string;
    newStatus: string;
    eventType: AdjudicationEventType;
    courtNames: string[];
    submissionSummaries: SubmissionSummaryDto[];
    timestamp: string;
}


export function createStompClient(
    baseUrl: string,
    topic: string,
    username: string,
    onMessageReceived: (res: AdjudicationEvent) => void,
    onConnected?: (sessionId: string) => void): Client
{
    if (stompClient?.active) return stompClient;

    const socket = new SockJS(`${baseUrl}/ws`);
    stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str: string) => {
            console.log('[STOMP]', str);
        },
        reconnectDelay: 5000
    });

    stompClient.connectHeaders = {
        username: username,
    };

    stompClient.onConnect = () => {
        // URL pattern: http://host/ws/{serverId}/{sessionId}/websocket
        const transportUrl = (socket as unknown as { _transport?: { url?: string } })._transport?.url ?? '';
        const sessionId = transportUrl.split('/').slice(-2, -1)[0];
        if (sessionId && onConnected) {
            onConnected(sessionId);
        }

        // subscribe to broadcast topic
        stompClient!.subscribe(topic, (msg: IMessage) => {
            if (msg.body) {
                try {
                    const payload: AdjudicationEvent = JSON.parse(msg.body);

                    onMessageReceived(payload);
                } catch (e) {
                    console.error('Invalid message', e);
                }
            }
        });
    };

    stompClient.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Details: ' + frame.body);
    };

    stompClient.activate();
    return stompClient;
}

export function disconnectStompClient() {
    if (!stompClient) return;

    if (stompClient?.active) {
        stompClient.deactivate();
    }
}
