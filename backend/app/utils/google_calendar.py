"""
Google Calendar API Integration
Handles OAuth authentication and calendar synchronization
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# Configuration Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")
SCOPES = ['https://www.googleapis.com/auth/calendar']


def get_authorization_url(state: str) -> str:
    """
    Generate the Google OAuth authorization URL
    """
    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=SCOPES,
        state=state
    )

    flow.redirect_uri = GOOGLE_REDIRECT_URI

    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'  # Force to get refresh token
    )

    return authorization_url


def exchange_code_for_tokens(code: str, state: str) -> Dict:
    """
    Exchange authorization code for access and refresh tokens
    """
    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=SCOPES,
        state=state
    )

    flow.redirect_uri = GOOGLE_REDIRECT_URI
    flow.fetch_token(code=code)

    credentials = flow.credentials

    return {
        'access_token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_expiry': credentials.expiry,
        'scopes': credentials.scopes
    }


def refresh_access_token(refresh_token: str) -> Dict:
    """
    Refresh the access token using refresh token
    """
    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET
    )

    creds.refresh(Request())

    return {
        'access_token': creds.token,
        'token_expiry': creds.expiry
    }


def get_calendar_service(access_token: str, refresh_token: Optional[str] = None):
    """
    Get Google Calendar API service
    """
    expiry = datetime.utcnow() + timedelta(hours=1)  # Default expiry

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=SCOPES
    )

    # Refresh if expired
    if refresh_token and creds.expired:
        creds.refresh(Request())

    service = build('calendar', 'v3', credentials=creds)
    return service, creds


def create_calendar_event(
    access_token: str,
    refresh_token: str,
    titre: str,
    description: str,
    date_debut: datetime,
    date_fin: datetime,
    eleves_noms: List[str],
    lien_visio: Optional[str] = None
) -> Optional[str]:
    """
    Create an event in Google Calendar
    Returns the event ID
    """
    try:
        service, creds = get_calendar_service(access_token, refresh_token)

        # Préparer la description avec les noms des élèves
        full_description = f"{description}\n\nÉlèves: {', '.join(eleves_noms)}"
        if lien_visio:
            full_description += f"\n\nLien visio: {lien_visio}"

        event = {
            'summary': titre,
            'description': full_description,
            'start': {
                'dateTime': date_debut.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'end': {
                'dateTime': date_fin.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 30},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        }

        if lien_visio:
            event['location'] = lien_visio

        created_event = service.events().insert(
            calendarId='primary',
            body=event
        ).execute()

        return created_event['id']

    except HttpError as error:
        print(f'An error occurred: {error}')
        return None


def update_calendar_event(
    access_token: str,
    refresh_token: str,
    event_id: str,
    titre: str,
    description: str,
    date_debut: datetime,
    date_fin: datetime,
    eleves_noms: List[str],
    lien_visio: Optional[str] = None
) -> bool:
    """
    Update an existing event in Google Calendar
    """
    try:
        service, creds = get_calendar_service(access_token, refresh_token)

        # Préparer la description avec les noms des élèves
        full_description = f"{description}\n\nÉlèves: {', '.join(eleves_noms)}"
        if lien_visio:
            full_description += f"\n\nLien visio: {lien_visio}"

        event = {
            'summary': titre,
            'description': full_description,
            'start': {
                'dateTime': date_debut.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'end': {
                'dateTime': date_fin.isoformat(),
                'timeZone': 'Europe/Paris',
            },
        }

        if lien_visio:
            event['location'] = lien_visio

        service.events().update(
            calendarId='primary',
            eventId=event_id,
            body=event
        ).execute()

        return True

    except HttpError as error:
        print(f'An error occurred: {error}')
        return False


def delete_calendar_event(
    access_token: str,
    refresh_token: str,
    event_id: str
) -> bool:
    """
    Delete an event from Google Calendar
    """
    try:
        service, creds = get_calendar_service(access_token, refresh_token)

        service.events().delete(
            calendarId='primary',
            eventId=event_id
        ).execute()

        return True

    except HttpError as error:
        print(f'An error occurred: {error}')
        return False


def sync_from_google_calendar(
    access_token: str,
    refresh_token: str,
    start_date: datetime,
    end_date: datetime
) -> List[Dict]:
    """
    Fetch events from Google Calendar
    Returns list of events
    """
    try:
        service, creds = get_calendar_service(access_token, refresh_token)

        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_date.isoformat() + 'Z',
            timeMax=end_date.isoformat() + 'Z',
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])

        return events

    except HttpError as error:
        print(f'An error occurred: {error}')
        return []
