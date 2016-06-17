"""
Convert human-editable CSV files into JSON files, used by the web application.
"""

import json
import csv
from io import StringIO
from datetime import datetime




################################################################################
# CONFIG 


# behavior categories to include in the JSON file
categories = set(('G', 'M', 'W', 'C', 'E', 'F', 'H', 'I', 'P', 'S', 'V',)) #'A', 'L', 'O'

# time of first GPS point
firstGPStime = datetime(2014,1,24,5,36,14)

# seconds between each GPS point
intervalseconds = 60


class InFileNames:
    observations = 'behavior observation codes.csv'
    translations = 'behavior code translations.csv'
    mediafeatures = 'media features.json'
    gpstrack = 'GPS track.csv'
    pictures = 'pictures.csv'
    textbubbles = 'text bubbles.csv'
    videos = 'videos.csv'


class OutFileNames:
    behavior = 'behavior.json' # observations + translations
    behaviorcsv = 'behavior observation data.csv'
    media = 'media.js' # pictures, videos, text, media features




tourIntro = {
    'loc': [10.5142232962, -85.3693762701],
    'note': 'intro',
    'data': [],
    'time': '05:30:00',
    }

tourStart = {
    'loc': [10.5142232962, -85.3693762701],
    'note': 'start',
    'data': [],
    'time': '05:30:00',
    }
    
tourEnd = {
    'loc': [10.5148555432, -85.3643822484],
    'note': 'end',
    'data': [],
    'time': '18:10:43',
    }




# monkey patch json encoder to format floats
from json import encoder
encoder.FLOAT_REPR = lambda o: format(o, '.5f')


    


################################################################################
# GPS track

with open(InFileNames.gpstrack) as f:
    reader = csv.reader(f, skipinitialspace=True)
    GPStrack = [(float(lat[:9]), float(lon[:10])) for (lat,lon) in list(reader)[1:]]







def parsetime(timestr):
    """
    Get the time from a string, ignore the date.
    (Return a datetime with the date of the first GPS point.)
    """
    
    # take out the date (get only the last space-separated part)
    timestr = timestr.split()[-1]
    time = datetime.strptime(timestr, '%H:%M:%S').time()
    
    return datetime.combine(firstGPStime.date(), time)



def getTimeInterval(time):
    """
    Get start and end points on the GPS track, of the time interval containing "time".
    """
    
    index = int((time - firstGPStime).total_seconds() / intervalseconds)
    interval = GPStrack[index:index+2]
    
    if len(interval) == 2:
        return interval
    
    # if the time is past the last GPS point, return an interval with just the last GPS point    
    else:
        return (GPStrack[-1], GPStrack[-1])




def getGPSCoords(time):
    """
    Get a geographical point along Winslow Homer's GPS track, by linear interpolation
    """
    
    # get start and stop
    start, stop = getTimeInterval(time)
    
    timediff = (time - firstGPStime).total_seconds()
    proportion = (timediff % intervalseconds) / float(intervalseconds)
    
    latdelta = (stop[0] - start[0])
    lat = (proportion * latdelta) + start[0]
    
    londelta = (stop[1] - start[1])
    lon = (proportion * londelta) + start[1]
    
    return (lat, lon)





def loadTranslationsFile():
    """
    Load the translations file, return a list of dicts with the fields in the file
    """
    
    with open(InFileNames.translations) as f:
        reader = csv.DictReader(f, skipinitialspace=True)
        return list(reader)





def loadObservationFile(translations=None):
    """ 
    Load the observations file, return a list with a dict for each observation
    record, and a set with all of the unique behavior codes.
    
    
    """
    
    # ordered list of observations in file
    observations = [] 
    
    # set of codes we've seen
    codes = set() 
    
    
    with open(InFileNames.observations) as f:
        reader = csv.DictReader(f, skipinitialspace=True)
        
        for line in reader:  
            # look up GPS coordinates from timestamp
            line['loc'] = getGPSCoords(parsetime(line['timestamp']))
        
            # add a 'time' field without the date, to display to user
            line['time'] = line['timestamp'].split()[1]
        
            observations.append(line)
            codes.add(line['code'])
    
    
    return observations, codes
    
    
    


def filterObservationsTranslations():
    """ 
    Return (observations, translations) list containing the intersection 
    (inner join) of the observations and translations, and only in the 
    configured categories.
    """
    
    translations = loadTranslationsFile()
    observations, obs_code_set = loadObservationFile()
    
       
    # Find codes that occur in the observations, and are in the right categories.
    # Make a {code : translation-fields} 2-dimensional dict.
    translations_dict = {
        t['code'] : t
        for t in translations
        if  (t['code'] in obs_code_set)  and  (t['category'].upper() in categories)   }
    
    
    # Find observations that have a translation.
    observations = list(filter(lambda o: o['code'] in translations_dict, observations))
    
    
    return observations, translations_dict
    
    
    
    
    

def writeBehaviorJSON(observations, translations_dict, tourlist):
    """
    Write behavior JSON file, with observations and translations joined.
    """

    #observations, translations_dict = filterObservationsTranslations()
    
    # join together observations with translations
    behavior_list = [ checkOnTour(tourlist, o,
        {
            'time': o['time'],
            'loc': o['loc'],
            'text': translations_dict[o['code']]['english'],
            'cat': translations_dict[o['code']]['category'],
            'score': int(translations_dict[o['code']]['interestingness'])
        })
        for o in observations
    ]
    
    
    with open(OutFileNames.behavior, 'w') as f:
        json.dump({'behavior':behavior_list}, f)
    
         



def buildBehavior(observations, translations_dict, tourlist):
    writeBehaviorJSON(observations, translations_dict, tourlist)
    
    
    
    
    
    
    
    
def loadPictureCSV():
    """
    Load pictures from CSV file, and calculate coordinates for each picture
    from the timestamp.  Return a list of dicts, one dict for each picture.
    """
    
    with open(InFileNames.pictures) as f:
        reader = csv.DictReader(f, skipinitialspace=True)
        

        pictures = list(reader)
        
        # look up GPS coordinates from timestamp
        for p in pictures:
            p['loc'] = getGPSCoords(parsetime(p['timestamp']))

    return pictures
        



def pictureJSON(tourlist):
    """
    Format pictures into JSON
    """
    pictures = loadPictureCSV()
    
    return [ checkOnTour(tourlist, p,
        {
            'uri': p['filename'],
            'loc': p['loc'],
            'cap': p['english'],
            'time': p['timestamp'],
        })
    
        for p in pictures
    ]
    
    



def loadVideoCSV():
    with open(InFileNames.videos) as f:
        reader = csv.DictReader(f, skipinitialspace=True)
        
        videos = list(reader)
        
        for v in videos:
            v['loc'] = getGPSCoords(parsetime(v['timestamp']))
            
    return videos




def videoJSON(tourlist):
    videos = loadVideoCSV()

    return [ checkOnTour(tourlist, v,
        {
            'uri': v['uri'],
            'thumb': v['thumbnail'],
            'loc': v['loc'],
            'cap': v['english_caption'],
            'smtitle': v['english_short_title'],
            'title': v['english_title'],
            'time': v['timestamp'],
        })
        for v in videos
    ]


def loadTextbubbleCSV():
    with open(InFileNames.textbubbles) as f:
        reader = csv.DictReader(f, skipinitialspace=True)
        
        bubbles = list(reader)
        
        # look up GPS coordinates from timestamp
        for b in bubbles:
            b['loc'] = getGPSCoords(parsetime(b['timestamp']))
                    
                    
        return bubbles



def textbubbleJSON(tourlist):
    bubbles = loadTextbubbleCSV()

    return [ checkOnTour(tourlist, b, 
        {
            'loc': b['loc'],
            'title': b['english_title'],
            'text': b['english_text'],
            'time': b['timestamp'],
        })
        
        for b in bubbles
    ]

    




def mediaFeaturesJSON():
    with open(InFileNames.mediafeatures) as f:
        return json.load(f)






def buildTourList(observations):
    """
    Returns a list of each of the stops on the "guided tour" through the map.
    
    Each list item is a dict with the following keys: timestamp, loc, data, id.
    
    Id corresponds to the list position.  'data' contains the actual data  
    for this icon, to be used to lookup the id when the JSON files are output.
    """


    tourlist = []

    # for text bubbles, pictures, and observations,
    # add each to the tour list if the "on_tour" field is true
    
    for bubble in loadTextbubbleCSV():
        if bubble['on_tour']:
            tourlist.append({
                'time': bubble['timestamp'],
                'loc': bubble['loc'],
                'data': bubble,
            })

    
    for picture in loadPictureCSV():
        if picture['on_tour']:
            tourlist.append({
                'time': picture['timestamp'],
                'loc': picture['loc'],
                'data': picture,
            })


    for video in loadVideoCSV():
        if video['on_tour']:
            tourlist.append({
                'time': video['timestamp'],
                'loc': video['loc'],
                'data': video,
            })


    for obs in observations:
        if obs['on_tour']:
            tourlist.append({
                'time': obs['time'],  # obs['timestamp'] includes the date, use 'time' instead here
                'loc': obs['loc'],
                'data': obs,
            })



    # sort tour list by timestamp
    tourlist.sort(key=lambda o: o['time'])

    
    # add start and end markers, and intro placeholder
    tourlist.insert(0, tourStart)
    tourlist.insert(0, tourIntro)
    tourlist.append(tourEnd)
    
    
    
    # assign ID's to each item in the list
    for i, o in enumerate(tourlist):
        o['id'] = i
    
    
    return tourlist
    
    
    
def exportTourList(tourlist):
    """
    Remove 'data' field from tour list.
    """
    
    for i in tourlist:
        del i['data']
        
    return tourlist
    
    


def checkOnTour(tourlist, csv_datum, json_datum):
    """
    This method is for looking up tour ID's for each datum while generating JSON.
    
    For a particular behavior/picture/textbubble datum, check the CSV datum to 
    see if the on_tour field is checked.  Then, if it is, look up the tour ID
    for this datum and add it to the JSON datum.
    """    

    if csv_datum['on_tour']:
        
        # if this datum is on the tour, look up the key in the tour list
        tour_id = -1
        for i, item in enumerate(tourlist):
            if csv_datum == item['data']:
                tour_id = i
                break
                
        assert tour_id != -1
                
        json_datum['tour_id'] = tour_id

    return json_datum









    
def buildMedia(tourlist):
    with open(OutFileNames.media, 'w') as f:
        
        media = {
            'pictures': pictureJSON(tourlist),
            'videos': videoJSON(tourlist),
            'textbubbles': textbubbleJSON(tourlist),
        }
        
        media.update(mediaFeaturesJSON())
        
        media['tourlist'] = exportTourList(tourlist)
        
        f.write('var media=')
        f.write(json.dumps(media))
        f.write(';')

        
        
    
    
    
    

if __name__ == '__main__':

    observations, translations_dict = filterObservationsTranslations()

    tourlist = buildTourList(observations)
    
    buildBehavior(observations, translations_dict, tourlist)
    
    buildMedia(tourlist)
    
