import os
import matplotlib.pyplot as plt
import numpy as np
from project.server.explanations.tcav_explainer import load_tcavs
import csv


def run_experiment():

    rb_score_dict = load_tcavs(None, None, tcav_file_name="/Users/yannick/Documents/Studium/interVis/project/tcav_score_analyzer/ILSVRC2012inception_v3-tcavscores-stratified-robustness.pkl",
                           absolute_path=True)

    rerun_score_dict = load_tcavs(None, None, tcav_file_name="/Users/yannick/Documents/Studium/interVis/project/tcav_score_analyzer/ILSVRC2012inception_v3-tcavscore_rerun_stratified_full_concepts.pkl",
                           absolute_path=True)


    concepts = []

    for score in list(rb_score_dict.values())[0]:
        concept = score['concept'].split('_')[0]
        if concept not in concepts:
            concepts.append(concept)

    result_dict = {}
    result_dict['total_dist'] = {}
    for concept in concepts:
        result_dict[concept] = {}
        main_concept_val = 0.0
        other_concept_val = []
        for class_id in rb_score_dict:
            if class_id == 674:
                continue
            tcav_class = rb_score_dict[class_id]
            for score in [tc for tc in tcav_class if concept in tc['concept'] and '_' in tc['concept'] and tc['bottleneck'] == 'Mixed_7c']:
                # if score['bottleneck'] not in result_dict['total_dist']:
                #    result_dict['total_dist'][score['bottleneck']] = {}
                score['class'] = class_id
                if class_id not in result_dict[concept]:
                    result_dict[concept][class_id] = []
                if score['bottleneck'] == 'Mixed_7c' and score['concept'] in concepts:
                    main_concept_val = score['score']
                elif score['bottleneck'] == 'Mixed_7c':
                    other_concept_val.append(score['score'])
                result_dict[concept][class_id].append(score)
            for score in [tc for tc in rerun_score_dict[class_id] if concept == tc['concept'] and tc['bottleneck'] == 'Mixed_7c']:
                score['class'] = class_id
                result_dict[concept][class_id].append(score)
        result_dict['total_dist'][concept] = sum([abs(main_concept_val - val) for val in other_concept_val])

    return {"exp_info": {"name": "stratified concept sampling", "description": "Evaluate how the choice of the concept\
    dataset influences the scores. Returns", "nr_of_return_elements": 2}, "exp_result": result_dict}