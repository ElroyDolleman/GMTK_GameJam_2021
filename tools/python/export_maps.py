import re
import os
import json
from shutil import copyfile

# Run a bat file to export all the maps as json files
os.system(os.getcwd() + '\\tools\\batch\\export_tiled_maps.bat')

json_ouput = {}
source_dir = './assets/maps/export/'
tileset_source_dir = './assets/maps/tilesets/'
output_dir = './build/assets/'
directory = os.fsencode(source_dir)

json_tilesets = {}

# Iterate through every json file for every map
for filename in os.listdir(directory):
    # Getting the json content
    file = open(source_dir + filename.decode('utf-8'), 'r')
    json_string = file.read()
    file.close()
    json_content = json.loads(json_string)

    # Read the tileset file
    tileset_path = source_dir + json_content['tilesets'][0]['source']
    tileset_file = open(tileset_path, 'r')
    tileset_content = tileset_file.read()
    tileset_name = json_content['tilesets'][0]['source'].replace('../', '').replace('.tsx', '')

    json_level = {}

    # If tileset is new, add it to the json
    if tileset_name not in json_tilesets:
        tileset_name = tileset_name.replace('tilesets/','')
        json_tilesets[tileset_name] = {}
        current = json_tilesets[tileset_name]
        tiletypes_obj = {}

        for line in tileset_content.splitlines():

            # Copy the tileset to the output assets folder
            if 'image source' in line:
                result = re.search('<image source="(.*)" width', line)
                tileset_image_name = result.group(1)
                copyfile(tileset_source_dir + tileset_image_name, output_dir + tileset_image_name)

            elif 'tile id' in line:
                result = re.search('<tile id="(.*)">', line)
                tile_id = int(result.group(1))

            elif '"TileType"' in line:
                result = re.search('value="(.*)"/>', line)
                tiletype = result.group(1)

                # Store all tile id's that belong to the specified tiletype
                if len(tiletype) > 0:
                    if tiletype not in tiletypes_obj:
                        tiletypes_obj[tiletype] = []
                    tiletypes_obj[tiletype].append(tile_id)

        current['tiletypes'] = tiletypes_obj
    tileset_file.close()

    # Store the tiles data
    tiles = []
    for cell in json_content['layers'][0]['data']:
        tiles.append(cell - 1)

    # Create the levels json
    json_level['gridCellsX'] = json_content['width']
    json_level['gridCellsY'] = json_content['height']
    json_level['tiles'] = tiles
    json_level['tileset_name'] = tileset_name

    json_ouput[filename.decode('utf-8').replace('.json', '')] = json_level
json_ouput['tilesets_data'] = json_tilesets

# Uses all gathered data to output a single levels.json file
output_file = open(output_dir + 'levels.json', 'w+')
output_file.write(json.dumps(json_ouput, separators=(",", ":")))
output_file.close()