import project.tcav_score_analyzer.layer_scores as ls
import project.tcav_score_analyzer.mixed_bag_concepts as mb
import project.tcav_score_analyzer.stratified_concept_scores as scs
import project.tcav_score_analyzer.wordnet_correlation as wc
import pickle
import os


def run_or_load_tcav_experiments(rerun_exp=False):

    # layer score experiment
    ls_results = None
    if os.path.isfile('layer_score_exp.pkl') and not rerun_exp:
        with open('layer_score_exp.pkl', 'rb') as f:
            ls_results = pickle.load(f)
    else:
        ls_results = ls.run_experiment()
        with open('layer_score_exp.pkl', 'wb') as f:
            pickle.dump(ls_results, f)


    # mixed bag concept experiment
    #mb_results = None
    #if os.path.isfile('mixd_bag_exp.pkl') or rerun_exp:
    #    with open('mixed_bag_exp.pkl', 'rb') as f:
    #        mb_results = pickle.load(f)
    #else:
    #    mb_results = mb.run_experiment()
    #    with open('mixed_bag_exp.pkl', 'wb') as f:
    #        pickle.dump(mb_results, f)


    # stratified concept sampling experiment
    scs_results = None
    if os.path.isfile('stratified_sampling_exp.pkl') and not rerun_exp:
        with open('stratified_sampling_exp.pkl', 'rb') as f:
            scs_results = pickle.load(f)
    else:
        scs_results = scs.run_experiment()
        with open('stratified_sampling_exp.pkl', 'wb') as f:
            pickle.dump(scs_results, f)


    # swordnet correlation scores
    wc_results = None
    if os.path.isfile('wordnet_corr_exp.pkl') and not rerun_exp:
        with open('wordnet_corr_exp.pkl', 'rb') as f:
            wc_results = pickle.load(f)
    else:
        wc_results = wc.run_experiment()
        with open('wordnet_corr_exp.pkl', 'wb') as f:
            pickle.dump(wc_results, f)

    return {
        ls_results['exp_info']['name']: ls_results,
        # mb_results['exp_info']['name']: mb_results,
        scs_results['exp_info']['name']: scs_results,
        wc_results['exp_info']['name']: wc_results
    }
