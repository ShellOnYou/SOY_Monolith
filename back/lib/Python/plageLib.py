

import os
import tarfile
import sys
import shutil
import re
import stat  # for checking file modification rights
import json

# Makes zip behave the same in Python2 and Python3 
try:
    from itertools import izip as zip
    #print('python2')
except ImportError:
    #print('python3')
    pass


# Files for statement generation
archive = None
statement = None

# Files output by analysis
grade = None
log = None

# Variable for output language
locale = None

########## FUNCTIONS ##########

# ========== STATEMENTS ==========

def copy_archive(archive):
    """ Copy the archive in the correct location without processing """
    shutil.copyfile(archive, 'files/archive.tar.gz')


def copy_statement():
    """ Copy the html statement as is"""
    shutil.copyfile('common_statement.html', 'files/statement.html')


#### Used mainly for Question archive
# Prefer extract_expected_folder_from_submitted_archive for the student answer archive
def extract_folder_from_archive(archive, folder):
    """ Extract a single folder from archive """
    if tarfile.is_tarfile(archive):
        tarObj = tarfile.open(archive)
        subdir_and_files = [
            tarinfo for tarinfo in tarObj.getmembers()
            if tarinfo.name.startswith(folder + "/")
        ]
        tarObj.extractall(members=subdir_and_files)
        return True
    return False

def folder_is_present_in_archive(archive, name):
    """ Test if a folder is at the root of an archive """
    if tarfile.is_tarfile(archive):
        tarObj = tarfile.open(archive)
        for file in tarObj:
            if file.name == name and file.isdir():
                return True
    return False


def get_single_file_from_archive(file,archive):
    if not os.path.isfile(archive): return None 
    """ Locates a single file inside an archive and returns a fileObject pointing to it
         for reading it from python. This is done *without* extracting the file."""
    if tarfile.is_tarfile(archive):
        tarFile = tarfile.open(archive, 'r|gz')
        for t in tarFile:
            if file in t.name: 
                addLog("found "+file+" file")
                return tarFile.extractfile(t)
    return None         


def init_output_gen_file():
    """ Init output file for statement creation """
    global archive
    global statement
    archive = open('files/archive.tar.gz', 'w')
    statement = open('files/statement.html', 'w')


def init_script_generate():
    """ Creates/Cleans the 'files' folder (without going there)"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    if os.path.isdir('files'):
        clean_folder('files')
    else:
        os.makedirs('files')


def make_targz_file(output_filename, source_dir):
    """Compress source dir into output_filename"""
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(source_dir, arcname=os.path.basename(source_dir))

# ========== LOGS ==========

def init_log_file():
    global log
    log = open('log.txt', 'w')

def addLog(msg):
    """ Add a line in the log.txt file """
    global log
    if log is not None:
        log.write(msg+'\n')

def close_log():
    global log
    if log is not None:
        log.close()

# ========== ANALYSIS ==========


def clears_folder(fold):
    """ Clears the content of a folder that can contain 
    subfolders without write permissions """
    # if exists, then clears it.
    if os.path.isdir(fold) or os.path.isfile(fold):
        try:
            # re-establish write rights on all items of folder to be able to remove it
            items = []
            for dirname, dirnames, filenames in os.walk(fold):
                # get path to all subdirectories first.
                for subdirname in dirnames:
                    items.append(os.path.join(dirname, subdirname))
                # get path to all filenames.
                for filename in filenames:
                    items.append(os.path.join(dirname, filename))

            #log("Elements of the folder to change rights:",items)
            for i in items:
                os.chmod(i, 0o755)  # works on both Python 2 and 3

            # Then removes it
            shutil.rmtree(fold)  # errors are not ignored there
            # shutil.rmtree(fold, ignore_errors=True) # True ignores errors (but do not remove element !!!)
            addLog("Removed the previous "+fold+" folder")
        except Exception as e:
            addLog("Cannot remove the "+fold +
                   " folder for processing next student.")
            close_log()
            sys.exit(-1)


def end_analysis(tests, results, explains):
    """ Output jsons of comments+grade on stdout and close log file """
    global log
    global grade
    gradeNb = int(100.0*results.count(True)/len(tests))

    ## html_details = build_html_comment(tests, results, explains, gradeNb)
    #json_details = build_json_comment(tests, results, explains)
    json_details = build_json_comment_v2(tests, results, explains)
    addLog('#####\nFinal grade is '+str(gradeNb)+'%')
    
    # Output detailed results + grade on stdout
    #print ("{'grade': '"+str(gradeNb)+"', 'comment': '"+html_details+"' }")
    print ("{ \"grade\":"+str(gradeNb)+", \"comment\":"+json_details+" }")
    # Previously wrote grade in file: grade.write(str(gradeNb)+"\n") ; grade.close()
    close_log()
    sys.exit(0)


def end_if_no_more_answer_lines(tests, results, explains, num_test, lines):
    """ Test if the answer file has enought line.

    If it doesn't have enough lines, end the test """
    if len(lines) < 1:
        addLog("NOT OK : file with answers does not contain enough answer lines")
        results[num_test] = False
        if locale == "en":
            explains[num_test] = ' The file with answers does not contain enough answer lines.'
        elif locale == 'fr':
            explains[num_test] = ' Le fichier de réponses ne contient pas assez de lignes de réponses.'
        end_analysis(tests, results, explains)


def extract_expected_folder_from_submitted_archive(submitted, expected):
    """ Testing whether exected folder is present in a work submitted by a student """
    # Precondition : we know the submitted file exists and we have access to it

    if not tarfile.is_tarfile(submitted):
        if locale == "en":
            Expl = "The submitted file is not an archive<br/>"
            Expl += "Please check how you create it."
        elif locale == "fr":
            Expl = "Le fichier que vous proposez n'est pas vraiment une archive.<br/>"
            Expl += "Vérifiez la façon dont vous l'avez créée."
        addLog('File '+submitted +
               ' is not a tarfile (likely the student tried to fool the app)')
        return(False, Expl)
    # Archive can be opened
    tar = tarfile.open(submitted)
    # Checks that the student submitted archive contains a folder with name as expected
    found = True
    if expected not in tar.getnames():
        found = False
    else:
        dir = tar.getmember(expected)
        if not dir.isdir():
            found = False

    if not found:
        if locale == "en":
            Expl = "The folder inside your archive does not have the right name. It should be name "+expected
        elif locale == "fr":
            Expl = "Le dossier contenu dans votre archive n'a pas le bon nom. Il devrait s'appeler "+expected
        if tar.getnames()[0].startswith('..'):
            if locale == "en":
                Expl += "<br/>The first item in your archive begin with '..', "
                Expl += "probably because of where you created your archive."
                Expl += "<strong>Reminder</strong> : to include the content of a folder <code>ABC</code>"
                Expl += " in an archive, go to the parent folder of <code>ABC</code>."
            elif locale == "fr":
                Expl += "<br/>Le premier élément dans votre archive commence par '..', "
                Expl += "probablement en raison de l'endroit où vous avez créé votre archive."
                Expl += "<strong>Rappel</strong> : pour mettre le contenu d'un dossier <code>ABC</code>"
                Expl += " dans une archive, placez-vous dans le dossier parent de <code>ABC</code>."
        tar.close()
        addLog('TEST NOT OK: expected '+expected +
               ' folder not found in student archive')
        return (False, Expl)
    else:
        # Gets only the content of the expected folder
        # We proceed this way not to extract any content embbeded in the archive that would be outside the folder of interest
        subdir_and_files = [
            tarinfo for tarinfo in tar.getmembers()
            if tarinfo.name.startswith(expected+'/')
        ]
        #print("Elements a extraire :",subdir_and_files)
        tar.extractall(members=subdir_and_files)
        tar.close()
        addLog('OK: '+expected+' extracted from submitted archive')
        return(True, 'ok')


def init_analyze(tmpRep):
    """ Init all file and vars for analyzing """
    global grade
    global locale
    global log

   # Prepare for analysis
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    #grade = open('grade.txt', 'w')
    init_log_file()

    # Checks parameters
    if len(sys.argv) != 4 and len(sys.argv) != 5:
        addLog("Wrong number of parameters given to "+sys.argv[0])
        print(""" 
        Usage: """+sys.argv[0]+"""
          /absolute_path/statement_file.html 
            /absolute_path/question_archive_file 
              /absolute_path/answer_archive_file 
               [en|fr]\n""")
        sys.exit(-1)
    if len(sys.argv) == 4:
        locale = "en"
    else:
        locale = sys.argv[4].lower()
        if locale not in ['fr','en']:
            addLog("locale (last parameter) should be 'en' or 'fr'\n")
            sys.exit(-1)

    # Checks input files
    files_check(sys.argv[1], sys.argv[2], sys.argv[3])
    # Init tmp working directory ***AND*** chdir into it
    init_tmp_rep(tmpRep)
    return (sys.argv[1], sys.argv[2], sys.argv[3])


def files_check(quest_html, quest_arch, submit_arch):
    """ Check if the files given in parameters exist """
    if not os.path.isfile(quest_html):
        addLog('ERROR : cannot find statement file ' + quest_html)
        sys.exit(-3)

    if not os.path.isfile(quest_arch):
        addLog('ERROR : cannot find question archive file ' + quest_arch)
        sys.exit(-3)

    if not os.path.isfile(submit_arch):
        addLog('ERROR : cannot find submitted archive file ' + submit_arch)
        sys.exit(-3)


def ok_to_open(a_file):
    """ Check if a file is present and readable """
    if not os.path.isfile(a_file):  # file does not exist
        if locale == "en":
            Expl = "File "+a_file+" not found in submitted archive"
        elif locale == "fr":
            Expl = "Fichier "+a_file+" non trouvé dans l'archive remise"
        addLog('File '+a_file+' not found in submitted archive')
        return(False, Expl)
    # Check that user has read permission on this file (they might have done anything playing with permissions)
    if not (os.stat(a_file).st_mode & stat.S_IRUSR):
        if locale == 'en':
            Expl = "File " + a_file + " found but no read permission on it"
        elif locale == 'fr':
            Expl = "Fichier "+a_file+" trouvé dans l'archive remise mais sans droit d'exécution"
        addLog('File '+a_file+' found but no read permission on it')
        return(False)
    if locale == 'en':
        Expl = "File "+a_file+" exists and is readable"
    elif locale == 'fr':
        Expl = "Fichier "+a_file+" existe et est lisible"
    addLog('File '+a_file+' exists and is readable')
    return(True, Expl)

# Escape single quote signs so the string can be later included 
# in a json string using quotes as field delimiters 
# we want a double slash in front of each double quote sign
def escape_quotes(string):
    #return string.replace(r"'",r"\\'")
    return string.replace('"',r'\\"')


def compute_status(results):
   status = []
   for r in results:
        if r is None: 
            if locale == 'en':
                status.append("not tested")
            else:
                status.append("non testé")
        elif r is True:
            status.append("OK")
        else:
            if locale == 'en':
                status.append("NOT OK")
            else:
                status.append("PAS OK")
   return status


# This version of the function uses the json python module
# Note: json requires double quotes : ""
def build_json_comment_v2(tests, results, explains):

    status = compute_status(results) 
    nums = range(1,len(tests)+1)
    js = [{"numQ": n, "verif": v, "status":s, "expl": e} 
               for n,v,s,e  in list(zip(nums,tests,status,explains))]
    #print ("js: \n"); print(js) ; print("\n")

    # Escapes \ characters, quotes and other special characters
    d = json.dumps(js,ensure_ascii=False) 
    # ensure_ascii=False -> UTF8 (unicode) is used as output
    # (otherwise: all non-ASCII characters in the output are escaped with \uXXXX sequences, 
    #   and the result is a str instance consisting of ASCII characters only)
    #print("Dumps:\n" + d + "\n")
    return d

"""
    js = "[ "
    num = 0
    for t in range(len(tests)): # for each question in the exercise
        ch = '{numQ'
        num += 1
        if num>1:
            js+=", " # to separate from previous question
        js += '{"numQ":' + str(num)+','
        js += '"verif":' + '"' + escape_quotes(tests[t]) +'",'
        js += '"status":'
        if results[t] is None:  
            if locale == "en":
                js += '"not tested"'
            elif locale == "fr":
                js += '"pas testé"'
        elif results[t] is True:
            js += '"OK"'
        else: # result is False
            if locale == "en":
                js += '"NOT OK"'
            elif locale == "fr":
                js += '"PAS OK"'
        js+=', "expl":"'+escape_quotes(explains[t])+'"}'
    # all questions have been included
    return js+' ]'
"""

# Note: json requires double quotes : ""
def build_json_comment(tests, results, explains):
    """ Returns a JSON containing the analysis results wrt the format:
       [   
          {'numQ':1, 'verif':'bla bla', 'status':'ok', 'expl':'blabla'},
          {'numQ':2, 'verif':'bla bla', 'status':'ok', 'expl':'blabla'},
           ...
          {'numQ':x, 'verif':'bla bla', 'status':'ok', 'expl':'blabla'}
        ]
    """
    js = "[ "
    num = 0
    for t in range(len(tests)): # for each question in the exercise
        num += 1
        if num>1:
            js+=", " # to separate from previous question
        js += '{"numQ":' + str(num)+','
        js += '"verif":' + '"' + escape_quotes(tests[t]) +'",'
        js += '"status":'
        if results[t] is None:  
            if locale == "en":
                js += '"not tested"'
            elif locale == "fr":
                js += '"pas testé"'
        elif results[t] is True:
            js += '"OK"'
        else: # result is False
            if locale == "en":
                js += '"NOT OK"'
            elif locale == "fr":
                js += '"PAS OK"'
        js+=', "expl":"'+escape_quotes(explains[t])+'"}'
    # all questions have been included
    return js+' ]'


def build_html_comment(tests, results, explains, gradeNB):
    """ Returns an HTML string containing the analysis results.
     The string can contain " signs but ' signs need to be escapted as the whole thing will be
     included in a json string in this format : { 'grade': '', 'comment':'....'}
     This escape thing is done just before returning the string
    """

    buffer = "<div>"  # <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />"""
    if locale == "en":
        buffer += """<h2>Analysis log</h2> 
          <table class="result_analyse">
            <tr><th>Test #</th><th>Verification</th><th>State</th><th>Explanations</th></tr>\n"""
    elif locale == "fr":
        buffer += """<h2>Résultat de l'analyse</h2>   
          <table class="result_analyse">
             <tr><th>N° test</th><th>Vérification</th><th>Etat</th><th>Explication</th></tr>\n"""
    num = 0
    for t in range(len(tests)):
        num += 1
        buffer += '<tr><td><div class="testNb">'+str(num)+'</div></td>'
        buffer += '<td><div class="natureTest">'+tests[t]+'</div></td><br>'
        if results[t] is None:
            buffer += '<td><div class="unknown"> ? </div></td>'
            if locale == "en":
                buffer += '<td><div class="expl"> not tested</div></td>'
            elif locale == "fr":
                buffer += '<td><div class="expl"> pas testé</div></td>'
        elif results[t] is True:
            buffer += '<td><div class="ok">OK</div></td>'
            if len(explains[t]) > 4:  # if non trivial comment, output it
                buffer += '<td>'+explains[t]+'</td>'
            buffer += ' <td></td>'
        else:
            if locale == "en":
                buffer += '<td><div class="pbm"> NOT OK </div></td>'
            elif locale == "fr":
                buffer += '<td><div class="pbm"> PAS OK </div></td>'
            buffer += '<td><div class="expl"> '+explains[t]+'</div></td>'
        buffer += "</tr>\n"
    buffer += '</table></div>'
 
    # Grade is returned separately in the
    # if locale == "en":
    #     buffer += '<div id="grade">Final grade : ' + str(gradeNB)
    # elif locale == "fr":
    #     buffer += '<div id="grade">Note finale : ' + str(gradeNB)
    # previous version of library: print(buffer)

   # Escape single quote signs so the string can be later included in a json string using quotes as field delimiters
    #re.sub("'", "\\'",buffer)
    buffer = buffer.replace(r"'",r"\'")
    
    #if re.search("Résultat de l'analyse",buffer):
    #        print ('TROUVE')
    #        sys.exit()

    return buffer

# ========== GENERAL =========

def clean_folder(folder):
    """ Clean a folder:
            delete all files in a folder if it exists, else create the folder """
    for the_file in os.listdir(folder):
        file_path = os.path.join(folder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(e)


def init_tmp_rep(tmpRep):
    """ Init a temporary directory and change working directory """
    if os.path.isdir(tmpRep) or os.path.isfile(tmpRep):
        shutil.rmtree(tmpRep)
    os.mkdir(tmpRep)
    os.chdir(tmpRep)
