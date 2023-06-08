
#saved query
import spotipy
from spotipy.oauth2 import SpotifyOAuth
#player queries
from spotipy.oauth2 import SpotifyClientCredentials

from time import sleep
import random

import os
from flask import Flask, render_template, request, redirect, session, send_from_directory, jsonify

import json

from keys import keys

CLIENT_ID = '1304be7a1d9046eaab37212657b01ae1'
CLIENT_SECRET = '661f8a416401486aa44d03b61e2446aa'


app = Flask(__name__)
# app.config['SECRET_KEY'] = os.urandom(64)
# app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SESSION_FILE_DIR'] = './.flask_session/'
# Session(app)

squareLength = 10
VisitedSquare= [[0 for col in range(squareLength)] for row in range(squareLength)]
currentCoord = (5, 5)
lastEngagement = 0
# up, down, left, right
direction = 'up' 

playerHandler = None

@app.route("/<path:path>")
def home():
    return send_from_directory('static', path)


def verifyCoord(currCoord):
    if(currCoord[0]<0 or currCoord[0]>9 or currCoord[1]<0 or currCoord[1]>9):
        return False
    return True

@app.route("/getnext")
def getnext():
    global lastEngagement
    global currentCoord
    global direction
    engagement = request.args.get('engagement')
    #use engagement
    directionVector = (0,0)
    if direction == 'up':
        directionVector = (1,0)
    if direction == 'down':
        directionVector = (-1,0)
    if direction == 'left':
        directionVector = (0,-1)
    if direction == 'right':
        directionVector = (0,1)
    
    nextCoord = (-1,-1)
    if(not lastEngagement):
        lastEngagement = 50
    if(not engagement):
        engagement = 50
    if lastEngagement<engagement:
        # move in the current direction
        nextCoord = (currentCoord[0]+directionVector[0], currentCoord[1]+directionVector[1])
        # if not valid
        if(not verifyCoord(nextCoord)):  
            if(directionVector[0]):
                # move in perpendicular direction
                nextCoord = (currentCoord[0], currentCoord[1]+1)
                # if out of bounds move in the other direction
                if(not verifyCoord(nextCoord)):
                    nextCoord = (currentCoord[0], currentCoord[1]-1)
            else:
                # move in perpendicular direction
                nextCoord = (currentCoord[0]+1, currentCoord[1]) 
                # if out of bounds move in the other direction
                if(not verifyCoord(nextCoord)):
                    nextCoord = (currentCoord[0]-1, currentCoord[1])
    else:
        randDir = random.randint(0,3)
        newDir =(0,0)
        if(randDir == 0):
            newDir = (1,0)
        if(randDir == 1):
            newDir = (-1,0)
        if(randDir == 2):
            newDir = (0,1)
        if(randDir == 3):
            newDir = (0,-1)
        if(newDir == directionVector):
            newDir == (-1*directionVector[0], -1*directionVector[1])
        nextCoord = (currentCoord[0]+newDir[0], currentCoord[1]+newDir[1])
        if(not verifyCoord(nextCoord)):
            nextCoord = (currentCoord[0]-newDir[0], currentCoord[1]-newDir[1])
            # nextCoord = (random(10), random(10))

#  stupid backup
    #     nextCoord = (currentCoord[0]-directionVector[0], currentCoord[1]-directionVector[1])


    #play next song
    x, y = nextCoord
    track = DataSquare[x][y]
    changeTrack(playerHandler, track)
    #send back next coord
    response = {'x': x, 'y': y}
    return response


# GLOBAL DATA STRUCTURES
TrackList = []
StratifiedTrackList = []

DataSquare = [[0 for col in range(squareLength)] for row in range(squareLength)]

GenreBank = ["acoustic","afrobeat","alt-rock","alternative","ambient","anime","black-metal","bluegrass","blues","bossanova","brazil","breakbeat","british","cantopop","chicago-house","children","chill","classical","club","comedy","country","dance","dancehall","death-metal","deep-house","detroit-techno","disco","disney","drum-and-bass","dub","dubstep","edm","electro","electronic","emo","folk","forro","french","funk","garage","german","gospel","goth","grindcore","groove","grunge","guitar","happy","hard-rock","hardcore","hardstyle","heavy-metal","hip-hop","holidays","honky-tonk","house","idm","indian","indie","indie-pop","industrial","iranian","j-dance","j-idol","j-pop","j-rock","jazz","k-pop","kids","latin","latino","malay","mandopop","metal","metal-misc","metalcore","minimal-techno","movies","mpb","new-age","new-release","opera","pagode","party","philippines-opm","piano","pop","pop-film","post-dubstep","power-pop","progressive-house","psych-rock","punk","punk-rock","r-n-b","rainy-day","reggae","reggaeton","road-trip","rock","rock-n-roll","rockabilly","romance","sad","salsa","samba","sertanejo","show-tunes","singer-songwriter","ska","sleep","songwriter","soul","soundtracks","spanish","study","summer","swedish","synth-pop","tango","techno","trance","trip-hop","turkish","work-out","world-music"]

# X is row, Y is column
def getCoordScores(x, y) :
    cellwidth = 1/squareLength
    xlower = (x * cellwidth) #range from 0/10 to 9/10
    xtarget = xlower + 0.5*cellwidth
    ylower = (y *cellwidth)
    ytarget = ylower + 0.5*cellwidth
    return xtarget, ytarget

def convertToCoord(xvalue, yvalue) :
    cellwidth = 1/squareLength
    x = min(int(xvalue/cellwidth), 9) #min to prevent 1.00 value from mapping to invalid index 10
    y = min(int(yvalue/cellwidth), 9) #min to prevent 1.00 value from mapping to invalid index 10
    return x, y
def getFeatureValues(track) :
    client_credentials_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
    sp.trace = True
    tids = [track['uri']]
    features = sp.audio_features(tids)[0]
    valence = features['valence']
    energy = features['energy']
    return valence, energy


def genreRecommend(genre, valence, energy) :
    client_credentials_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
    results = sp.recommendations(seed_genres=[genre], target_valence=valence, target_energy=energy, limit=1)
    for track in results['tracks']:
        print('Recommendation: %s - %s', track['name'],
                    track['artists'][0]['name'])
    return track



def addTracksToList(results) :
    # print(len(TrackList)) # shows TrackList size as populated
    for item in results['items']:
        track = item['track']
        TrackList.append(track)


def populateStratified() :
    # GET SAVED LIBRARY
    scope = 'user-library-read'
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            redirect_uri="http://localhost:8080",
            scope=scope))
    results = sp.current_user_saved_tracks(limit=50)
    # EXTRACT ALL TRACKS
    addTracksToList(results)
    while results['next']:
        results = sp.next(results)
        addTracksToList(results)
    numTracks = len(TrackList)
    print(f"numTracks: {numTracks}")
    # STRATIFY 50 TRACKS
    count = 0
    for i in range(0, numTracks, max(int(numTracks/50), 1)) :
        track = TrackList[i]
        StratifiedTrackList.append(track)
        print("%32.32s %s" % (track['artists'][0]['name'], track['name']))
        count += 1
        if (count == 50) : break

def setupPlayer() :
    scope = "user-read-playback-state,user-modify-playback-state"
    playerHandler = spotipy.Spotify(client_credentials_manager=SpotifyOAuth(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            redirect_uri="http://localhost:8080",
            scope=scope))
    # playing devices
    res = playerHandler.devices()
    return playerHandler

def changeTrack(playerHandler, track) :
    if (playerHandler == None) : return
    trackuri = track['uri']
    playerHandler.start_playback(uris=[trackuri])


if __name__ == '__main__' : 

    populateStratified()
    
    # global playerHandler
    playerHandler = setupPlayer()
    
    # trackuri = 'spotify:track:2CxjDTsUBmVlcMjjy2UETJ'
    # track = StratifiedTrackList[0]
    # changeTrack(playerHandler=playerHandler, track=track)
    # sleep(5)
    # track = StratifiedTrackList[1]
    # changeTrack(playerHandler=playerHandler, track=track)
    
    # POPULATE DATA SQUARE WITH USER TRACKS
    for track in StratifiedTrackList :
        valence, energy = getFeatureValues(track)
        x, y = convertToCoord(xvalue=valence, yvalue=energy)
        # print(valence, energy)
        # print(x, y)
        if DataSquare[x][y] == 0 :
            DataSquare[x][y] = track
            # DataSquare[x][y] = (x, y)

    # POPULATE EMPTY SQUARES WITH RECCOMENDATIONS
    for x, row in enumerate(DataSquare) :
        for y, cell in enumerate(row) :
            if cell!=0 : continue
            xtarget, ytarget = getCoordScores(x, y)
            genre= random.choice(GenreBank)

            track = genreRecommend(genre, valence=xtarget, energy=ytarget)
            DataSquare[x][y] = track

    # for x, row in enumerate(DataSquare) :
    #     for y, track in enumerate(row) :
    #         print(track['name']) 
        
    # changeTrack(playerHandler, DataSquare[0][8])

    app.run(debug=True, port=8888)


    
