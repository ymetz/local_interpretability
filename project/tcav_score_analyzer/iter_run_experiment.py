import os
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from project.server.explanations.tcav_explainer import load_tcavs
import csv
import statistics


def run_experiment():
    tcav_scores_dict = {}
    tcav_iter_path = '/Users/yannick/Documents/Studium/interVis/project/tcav_score_analyzer/tcav_iter_runs'
    iter_run_list = []
    for file in os.listdir(tcav_iter_path):
        if file == '.DS_Store':
                continue
        iter_runs = file.split('_')[-1].split('.')[0]
        iter_run_list.append(int(iter_runs))
        tcav_scores_dict[iter_runs] = load_tcavs(None, None, tcav_file_name=os.path.join(tcav_iter_path, file),
                                                      absolute_path=True)
    iter_run_list.sort()

    concepts = []

    for score in list(tcav_scores_dict[iter_runs[0]].values())[0]:
        concept = score['concept'].split('_')[0]
        if concept not in concepts:
            concepts.append(concept)

    result_dict = dict()
    distances = dict()
    for iters in iter_run_list:
        if iters == 50:
            continue
        distances[iters] = {}
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

        best_results = {}
        other_results = {}
        for the_class in result_dict[concept].items():
            best_results[the_class[0]] = [score for score in the_class[1] if score['nr_iter'] == 50][0]
            other_results[the_class[0]] = [score for score in the_class[1] if score['nr_iter'] != 50]

        for nr_iters in iter_run_list:
            if nr_iters == 50:
                continue
            if concept not in distances[nr_iters]:
                distances[nr_iters][concept] = []
            for the_class in result_dict[concept].items():
                distances[nr_iters][concept].extend(
                    [(best_results[the_class[0]]['p_val'] <= 0.05) == (score['p_val'] <= 0.05) for score in
                     other_results[the_class[0]] if score['nr_iter'] == int(nr_iters)])
                # distances[nr_iters][concept].extend([abs(best_results[the_class[0]]['score'] - score['score']) for score in other_results[the_class[0]] if score['nr_iter'] == int(nr_iters)])
        # result_dict[concept]['dist_from_best'] =

    iterwise_dists = []
    x,y = [],[]
    for nr_of_iters in iter_run_list:
        avg_concept_dists = []
        if nr_of_iters == 50:
            iterwise_dists.append(1)
            continue
        dists = distances[nr_of_iters]
        for concept in dists:
            avg_concept_dists.append(np.count_nonzero(np.array(dists[concept])) / len(dists[concept]))
            #x.append(nr_of_iters)
            #y.append(statistics.mean(dists[concept]))
        iterwise_dists.append(statistics.mean(avg_concept_dists))


    fig, ax = plt.subplots()
    ax.plot(np.array(iter_run_list, dtype=np.int8), np.array(iterwise_dists), '-bD', markevery=True)
    ax.scatter(np.array(x, dtype=np.int8), np.array(y))

    ax.set_xlim(xmin=0)
    ax.set_ylim(ymin=0.5)
    ax.set(xlabel='#of random experiments', ylabel='% of scores assigned same significance',
           title='Consensus in significance test for differing nr. of random experiments')
    ax.grid()

    fig.savefig("test.png")
    plt.show()

run_experiment()
'''
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
'''