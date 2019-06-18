import os
import matplotlib.pyplot as plt
import numpy as np
from project.server.explanations.tcav_explainer import load_tcavs
import csv

tcav_scores_dict = load_tcavs(None, None, tcav_file_name="/Users/yannick/Documents/Studium/interVis/models/"
                                                  "tensorflow_inception_v3/imagenetinception-tcavscores.pkl",
                       absolute_path=True)

mixed_bag_score_dict = load_tcavs(None, None, tcav_file_name="mixed_bag_concept_scores.pkl",
                       absolute_path=True)


with open('mixed_bad_experiment.csv', 'w') as f:

    csv_writer = csv.writer(f, delimiter=',')

    for class_id in mixed_bag_score_dict:
        tcav_class = mixed_bag_score_dict[class_id]
        for score in [tc for tc in tcav_class if tc['bottleneck'] == 'Mixed_7c']:
            mixed_concepts = score['concept'].split('_')[1:]
            scores_pairs = [(score['concept'], score['score']) for score in tcav_scores_dict[class_id]
                           if score['concept'] in mixed_concepts and score['bottleneck'] == 'Mixed_7c']
            line = [class_id, str(score['score'])]
            for sp in scores_pairs:
                line += [sp[0], sp[1]]
            line += score['random_score']
            csv_writer.writerow(line)













