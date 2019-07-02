from project.tcav_score_analyzer import run_or_load_experiments as rol


'''
    TcavExperimentHandler
    Serves as the interface between server and tcav_score_analyzer module
'''
class TcavExperimentHandler:

    def __init__(self):
        self.experiment_results = rol.run_or_load_tcav_experiments()

    def return_experiment_list(self):
        return list(self.experiment_results.keys())

    def return_experiment_result(self, key):
        return self.experiment_results[key]



