class Algorithm:

    __instance = None

    @staticmethod
    def get_instance():
        if Algorithm.__instance == None:
            Algorithm()
        return Algorithm.__instance

    def __init__(self):
        if Algorithm.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            Algorithm.__instance = self

    def distance_imbalance(self, distances, medical_centers_unbalances):
        medical_centers = {index for index, value in enumerate(distances)}
        medical_centers_balances = medical_centers - medical_centers_unbalances
        return sum(abs(distances[i] - distances[j])
                   for i in medical_centers_unbalances for j in medical_centers_balances)
