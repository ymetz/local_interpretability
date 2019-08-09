import os
import matplotlib.pyplot as plt
import numpy as np
from project.server.explanations.tcav_explainer import load_tcavs
import csv


def run_experiment():
    tcav_scores_dict = {}
    tcav_iter_path = '/Users/yannick/Documents/Studium/interVis/project/tcav_score_analyzer/tcav_iter_runs'
    iter_run_list = []
    for file in os.listdir(tcav_iter_path):
        iter_runs = file.split('_')[-1].split('.')[0]
        iter_run_list.append(iter_runs)
        tcav_scores_dict[iter_runs] = load_tcavs(None, None, tcav_file_name=os.path.join(tcav_iter_path, file),
                                                      absolute_path=True)

    concepts = []

    for score in list(tcav_scores_dict[iter_runs[0]].values())[0]:
        concept = score['concept'].split('_')[0]
        if concept not in concepts:
            concepts.append(concept)

    result_dict = {}
    result_dict['total_dist'] = {}
    for concept in concepts:
        result_dict[concept] = {}
        for nr_iter in tcav_scores_dict:
            rb_score_dict = tcav_scores_dict[nr_iter]
            for class_id in rb_score_dict:
                tcav_class = rb_score_dict[class_id]
                for score in [tc for tc in tcav_class if concept in tc['concept'] and tc['bottleneck'] == 'Mixed_7c']:
                    score['class'] = class_id
                    score['nr_iter'] = int(nr_iter)
                    if class_id not in result_dict[concept]:
                        result_dict[concept][class_id] = []
                    result_dict[concept][class_id].append(score)
        result_dict['total_dist'][concept] = sum([np.var([score['score'] for score in result_dict[concept][class_id]]) for class_id in tcav_scores_dict[iter_run_list[0]]])

    return {"exp_info": {"name": "random experiment iterations", "description": "Evaluate how the chosen number of runs\
     for the random experiments affect the scores", "nr_of_return_elements": 2}, "exp_result": result_dict}
