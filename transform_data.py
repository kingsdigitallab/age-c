import pandas as pd
import json

# Helper function to append data to a specific film_id
def append_to_film(film_id, key, value, combined_data):
    if film_id not in combined_data:
        combined_data[film_id] = {}
    if key not in combined_data[film_id]:
        combined_data[film_id][key] = []
    combined_data[film_id][key].append(value)

# Load and clean CSV files (remove empty "Unnamed" columns)
df_cleaned = pd.read_csv('data_delivery/gargantua/main.csv').dropna(axis=1, how='all')
genre_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/genre.csv').dropna(axis=1, how='all')
nat_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/nat.csv').dropna(axis=1, how='all')
roles_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/roles.csv').dropna(axis=1, how='all')
char_tags_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/char_tags.csv').dropna(axis=1, how='all')
plot_tags_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/plot_tags.csv').dropna(axis=1, how='all')
biog_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/biog.csv').dropna(axis=1, how='all')
biog_nat_dataframe_cleaned = pd.read_csv('data_delivery/gargantua/biog_nat.csv').dropna(axis=1, how='all')

# Initialize an empty dictionary to store the combined data
combined_data = {}

# Step 1: Add basic film metadata from df_cleaned
for _, row in df_cleaned.iterrows():
    film_id = row['film_id']
    metadata_info = {
        'nat_title': row['nat_title'],
        'eng_title': row['eng_title'],
        'release_type': row['release_type'],
        'release_date': row['release_date'],
        'film_type': row['film_type'],
        'close_view': row['Close viewing?']
    }
    # Ensure the film_id entry exists, then add the metadata
    if film_id not in combined_data:
        combined_data[film_id] = {}
    combined_data[film_id]['metadata'] = metadata_info

# Step 2: Add genre data
for _, row in genre_dataframe_cleaned.iterrows():
    film_id = row['film_id']
    genre_info = {'film_genre': row['film_genre']}
    append_to_film(film_id, 'film_genre', genre_info, combined_data)

# Step 3: Add nationality data
for _, row in nat_dataframe_cleaned.iterrows():
    film_id = row['film_id']
    nat_info = {'film_country': row['film_country'], 'prod_share': row['prod_share']}
    append_to_film(film_id, 'film_country', nat_info, combined_data)

# Step 4: Add roles data
for _, row in roles_dataframe_cleaned.iterrows():
    film_id = row['film_id']
    role_info = {
        'person_id': row['person_id'],
        'person_name': row['person_name'],
        'role_class': row['role_class']
    }
    append_to_film(film_id, 'roles', role_info, combined_data)

# Step 5: Add character tags
for _, row in char_tags_dataframe_cleaned.iterrows():
    film_id = row['film_id']
    char_tag_info = {
        'character_id': row['character_id'],
        'person_id': row['person_id'],
        'ch_age': row['ch_age'],
        'ch_gender': row['ch_gender'],
        'ch_sexuality': row['ch_sexuality'],
        'ch_porigin': row['ch_porigin'],
        'ch_class': row['ch_class'],
        'ch_profession': row['ch_profession'],
        'ch_ability': row['ch_ability']
    }
    append_to_film(film_id, 'character_tags', char_tag_info, combined_data)

# Step 6: Add plot tags
for _, row in plot_tags_dataframe_cleaned.iterrows():
    film_id = row['film_id']
    plot_tag_info = {
        'tag_id': row['tag_id'],
        'tag_name': row['tag_name']
    }
    append_to_film(film_id, 'plot_tags', plot_tag_info, combined_data)

# Step 7: Create dictionaries for easy lookup from biog and biog_nat
biog_dict = {}
for _, row in biog_dataframe_cleaned.iterrows():
    person_name = row['person_name']
    biog_dict[person_name] = {
        'birth_year': row['birth_year'],
        'death_year': row['death_year'],
        'gender': row['gender']
    }

biog_nat_dict = {}
for _, row in biog_nat_dataframe_cleaned.iterrows():
    person_name = row['person_name']
    if person_name not in biog_nat_dict:
        biog_nat_dict[person_name] = []
    biog_nat_dict[person_name].append(row['person_nat'])

# Step 8: Add biog and biog_nat data to roles
for film_id, film_data in combined_data.items():
    if 'roles' in film_data:
        for role in film_data['roles']:
            person_name = role['person_name']
            if person_name in biog_dict:
                # Add birth_year, death_year, and gender
                role.update(biog_dict[person_name])
            if person_name in biog_nat_dict:
                # Add nationality (person_nat)
                role['person_nat'] = biog_nat_dict[person_name]

# Step 9: Convert the combined data to JSON format
final_combined_json = json.dumps(combined_data, indent=4)

# Print the resulting JSON (or save it to a file)
print(final_combined_json)

output_file_path = 'data_delivery/processed/gargantua.json'

# Save the JSON content to the specified file
with open(output_file_path, 'w') as json_file:
    json.dump(combined_data, json_file, indent=4)
